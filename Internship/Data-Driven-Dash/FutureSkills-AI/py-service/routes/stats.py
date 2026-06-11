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
        if avg_result
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
        "top_country": top_country[0]["_id"],
        "top_role": top_role[0]["_id"]
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
        jobs.find({}, {"_id": 0}).limit(20)
    )

    return data