from fastapi import APIRouter
from db import db

router = APIRouter()

jobs = db["jobs"]

@router.get("/summary")
def get_summary():

    total_jobs = jobs.count_documents({})

    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_salary": {"$avg": "$salary"}
            }
        }
    ]

    avg_result = list(jobs.aggregate(pipeline))

    avg_salary = (
        round(avg_result[0]["avg_salary"], 2)
        if (avg_result and avg_result[0]["avg_salary"] is not None)
        else 0
    )

    top_country = jobs.aggregate([
        {
            "$group": {
                "_id": "$country",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ])

    top_country = list(top_country)

    top_role = jobs.aggregate([
        {
            "$group": {
                "_id": "$job_title",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ])

    top_role = list(top_role)

    return {
        "total_jobs": total_jobs,
        "avg_salary": avg_salary,
        "top_country": top_country[0]["_id"] if top_country else "N/A",
        "top_role": top_role[0]["_id"] if top_role else "N/A"
    }






@router.get("/trend")
def get_trend():

    pipeline = [
        {
            "$group": {
                "_id": "$job_posting_year",
                "jobs": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    result = list(jobs.aggregate(pipeline))

    trend_data = []

    for item in result:
        trend_data.append({
            "year": item["_id"],
            "jobs": item["jobs"]
        })

    return trend_data


@router.get("/top")
def get_top_skills():

    skill_counts = {
        "Python": jobs.count_documents({"skills_python": 1}),
        "SQL": jobs.count_documents({"skills_sql": 1}),
        "Machine Learning": jobs.count_documents({"skills_ml": 1}),
        "Deep Learning": jobs.count_documents({"skills_deep_learning": 1}),
        "Cloud": jobs.count_documents({"skills_cloud": 1})
    }

    result = []

    for skill, count in skill_counts.items():
        result.append({
            "skill": skill,
            "count": count
        })

    result.sort(
        key=lambda x: x["count"],
        reverse=True
    )

    return result




@router.get("/jobs")
def get_jobs():

    data = list(
        jobs.find({}, {"_id": 0}).limit(50)
    )

    return data


@router.get("/forecast")
def get_forecast(metric: str = "jobs", horizon: int = 14):
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
    
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year": "$job_posting_year",
                    "month": "$job_posting_month"
                },
                "jobs": {"$sum": 1},
                "salary": {"$avg": "$salary"},
                "job_openings": {"$sum": "$job_openings"}
            }
        }
    ]
    
    results = list(jobs.aggregate(pipeline))
    results_sorted = sorted(results, key=lambda x: (x["_id"]["year"], x["_id"]["month"]))
    
    if len(results_sorted) < 10:
        return {"error": "Not enough data for forecasting"}
        
    data = []
    for idx, r in enumerate(results_sorted):
        year = r["_id"]["year"]
        month = r["_id"]["month"]
        
        if metric == "salary":
            val = r["salary"]
        elif metric == "job_openings":
            val = r["job_openings"]
        else:
            val = r["jobs"]
            
        data.append({
            "index": idx,
            "date": f"{year}-{month:02d}",
            "value": float(val) if val is not None else 0.0
        })
        
    X = np.array([item["index"] for item in data]).reshape(-1, 1)
    y = np.array([item["value"] for item in data])
    
    split_idx = len(data) - 6
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # 1. Linear Regression
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred_test = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
    mape = float(mean_absolute_percentage_error(y_test, y_pred_test)) * 100
    
    model_full = LinearRegression()
    model_full.fit(X, y)
    y_pred_full = model_full.predict(X)
    residuals = y - y_pred_full
    std_err = float(np.std(residuals))
    
    # 2. Random Forest Regressor
    model_rf = RandomForestRegressor(n_estimators=100, random_state=42)
    model_rf.fit(X_train, y_train)
    y_pred_test_rf = model_rf.predict(X_test)
    rmse_rf = float(np.sqrt(mean_squared_error(y_test, y_pred_test_rf)))
    mape_rf = float(mean_absolute_percentage_error(y_test, y_pred_test_rf)) * 100
    
    model_full_rf = RandomForestRegressor(n_estimators=100, random_state=42)
    model_full_rf.fit(X, y)
    y_pred_full_rf = model_full_rf.predict(X)
    residuals_rf = y - y_pred_full_rf
    std_err_rf = float(np.std(residuals_rf))
    
    last_idx = data[-1]["index"]
    last_year = results_sorted[-1]["_id"]["year"]
    last_month = results_sorted[-1]["_id"]["month"]
    
    forecast_data = []
    forecast_data_rf = []
    curr_year = last_year
    curr_month = last_month
    
    for i in range(1, horizon + 1):
        curr_month += 1
        if curr_month > 12:
            curr_month = 1
            curr_year += 1
            
        pred_idx = last_idx + i
        
        # LR Forecast
        pred_val = float(model_full.predict([[pred_idx]])[0])
        pred_val = max(0.0, pred_val)
        forecast_data.append({
            "date": f"{curr_year}-{curr_month:02d}",
            "value": round(pred_val, 2),
            "lower": round(max(0.0, pred_val - 1.96 * std_err), 2),
            "upper": round(pred_val + 1.96 * std_err, 2)
        })
        
        # RF Forecast
        pred_val_rf = float(model_full_rf.predict([[pred_idx]])[0])
        pred_val_rf = max(0.0, pred_val_rf)
        forecast_data_rf.append({
            "date": f"{curr_year}-{curr_month:02d}",
            "value": round(pred_val_rf, 2),
            "lower": round(max(0.0, pred_val_rf - 1.96 * std_err_rf), 2),
            "upper": round(pred_val_rf + 1.96 * std_err_rf, 2)
        })
        
    historical_data = [{
        "date": item["date"],
        "value": round(item["value"], 2)
    } for item in data]
    
    return {
        "historical": historical_data,
        "forecast": forecast_data,
        "forecast_rf": forecast_data_rf,
        "metadata": {
            "model_type": "Linear Regression",
            "rmse": round(rmse, 2),
            "mape": f"{round(mape, 2)}%"
        },
        "metadata_rf": {
            "model_type": "Random Forest Regressor",
            "rmse": round(rmse_rf, 2),
            "mape": f"{round(mape_rf, 2)}%"
        }
    }