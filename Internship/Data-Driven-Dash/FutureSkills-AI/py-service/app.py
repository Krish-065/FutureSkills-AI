from fastapi import FastAPI
from routes.stats import router

app = FastAPI()

app.include_router(
    router,
    prefix="/stats",
    tags=["Stats"]
)