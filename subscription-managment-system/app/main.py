from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import subscription_api
from app.database.connection import Base, engine, get_db
from app.services.subscription_service import start_scheduler

app = FastAPI()
app.include_router(subscription_api.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    start_scheduler(db)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your frontend domain(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)