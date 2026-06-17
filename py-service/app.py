from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.stats import router as stats_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(stats_router, prefix="/stats")