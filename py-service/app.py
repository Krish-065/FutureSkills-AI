from fastapi import FastAPI
from routes.stats import router as stats_router

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(stats_router, prefix="/stats")