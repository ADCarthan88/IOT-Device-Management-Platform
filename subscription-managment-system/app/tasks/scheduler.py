from app.database.connection import SessionLocal
from app.services.subscription_service import run_expiry_and_alerts
from apscheduler.schedulers.background import BackgroundScheduler

def start_background_tasks():
    scheduler = BackgroundScheduler()
    # Use a new DB session for each run
    scheduler.add_job(lambda: run_expiry_and_alerts(SessionLocal()), 'interval', hours=24)
    scheduler.start()
    return scheduler