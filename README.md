# FutureSkills-AI: AI Job Market Intelligence & Predictive Analytics Platform

**FutureSkills-AI** is a data-driven intelligence dashboard and predictive analytics platform built using a modern decoupled architecture (MERN + FastAPI). The platform aggregates, analyzes, and forecasts trends in global AI skill requirements, employment metrics, and market salaries to help developers, educators, and recruiters align with future job demands.

---

## 🚀 Key Features

* **Live Market Intelligence KPIs:** Instant visibility into critical metrics such as total jobs ingested, global average salary, top hiring country, and the most in-demand job role.
* **Interactive Filtering & URL Syncing:** Search by keywords and filter by Country or Experience Level. Filter states are automatically synced to URL search parameters for easy sharing.
* **Hiring Trend & ML Forecasting:** A Composed Line Chart displaying historical hiring volumes side-by-side with a **14-month predictive forecast** calculated using an ML model, complete with standard error confidence boundaries (95% CI).
* **AI Skill Distribution Analytics:** A responsive Recharts bar chart showing the frequency of key tools and methodologies (Python, SQL, Machine Learning, Deep Learning, Cloud) across all postings.
* **Interactive Job Registry Database:** A paginated, sortable, and filterable datagrid displaying full job attributes (Salary, Location, Openings, Industry) for in-depth exploration.
* **Robust API Gateway with Caching:** Express-based API gateway implementing user authentication (JWT + bcrypt), express-rate-limit, and a 30-second memory cache to optimize heavy analytics query responses.

---

## 🏗️ Architecture Design

```
                     ┌──────────────────┐
                     │  Vite + React    │
                     │  (Client Port)   │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Node/Express API │
                     │   (Port 5000)    │
                     └────────┬─────────┘
               ┌──────────────┴──────────────┐
               ▼                             ▼
      ┌──────────────────┐          ┌──────────────────┐
      │  FastAPI Service │          │  MongoDB Atlas   │
      │   (Port 8000)    │          │  (Cloud Database)│
      └──────────────────┘          └──────────────────┘
```

---

## 🛠️ Project Structure

* `/web` - Vite, React, React Router v7, and Recharts frontend.
* `/api` - Node.js, Express, Mongoose schemas, and JWT Auth middleware.
* `/py-service` - Python (FastAPI), Pandas data aggregation, and Scikit-learn Linear Regression model.
* `/docs` - System diagrams and architecture layout specs.

---

## 🏁 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* MongoDB Atlas Cluster Connection URI

---

### Setup Instructions

#### 1. Database & Ingestion Setup
1. Define your connection string under `MONGO_URI` in both `api/.env` and `py-service/.env`.
2. Navigate to `/py-service`, activate the virtual environment (`.\venv\Scripts\activate`), and run the ingestion pipeline to populate MongoDB Atlas:
   ```bash
   python ingest/ingest_jobs.py
   ```

#### 2. Run Python Analytics Service
Navigate to `/py-service` and start the FastAPI uvicorn server:
```bash
uvicorn app:app --host 127.0.0.1 --port 8000
```

#### 3. Run Node.js API Gateway
Navigate to `/api`, install dependencies, and start the development server:
```bash
npm install
npm run dev
```

#### 4. Run Vite React Frontend
Navigate to `/web`, install packages, and start the development server:
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 Predictive Model Specifications
The forecasting engine uses a **Linear Regression** model trained on monthly aggregated historical time-series data. 
* **Validation Split:** Holds out the last 6 months of metrics for model validation.
* **Validation Accuracy metrics:** Measures performance dynamically using RMSE and MAPE.
* **Confidence Boundaries:** Calculates standard error offsets based on residuals to display 95% Confidence Intervals.
