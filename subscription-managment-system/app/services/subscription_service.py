from sqlalchemy.orm import Session
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate
from datetime import datetime, timedelta
from typing import List, Optional
from app.services.email_service import EmailService
from apscheduler.schedulers.background import BackgroundScheduler

class SubscriptionService:
    @staticmethod
    def create_subscription(db: Session, subscription: SubscriptionCreate) -> Subscription:
        db_subscription = Subscription(**subscription.dict())
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
        return db_subscription

    @staticmethod
    def get_subscription(db: Session, subscription_id: int) -> Optional[Subscription]:
        return db.query(Subscription).filter(Subscription.id == subscription_id).first()

    @staticmethod
    def get_subscriptions_by_email(db: Session, email: str) -> List[Subscription]:
        return db.query(Subscription).filter(Subscription.user_email == email).all()

    @staticmethod
    def update_subscription(db: Session, subscription_id: int, update_data: SubscriptionUpdate) -> Optional[Subscription]:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if subscription:
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(subscription, field, value)
            db.commit()
            db.refresh(subscription)
        return subscription

    @staticmethod
    def renew_subscription(db: Session, subscription_id: int, months: int = 1) -> Optional[Subscription]:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if subscription:
            subscription.end_date = subscription.end_date + timedelta(days=30 * months)
            subscription.is_active = True
            db.commit()
            db.refresh(subscription)
        return subscription

    @staticmethod
    def get_expiring_subscriptions(db: Session, days_ahead: int = 3) -> List[Subscription]:
        cutoff_date = datetime.utcnow() + timedelta(days=days_ahead)
        return db.query(Subscription).filter(
            Subscription.end_date <= cutoff_date,
            Subscription.is_active == True
        ).all()

    @staticmethod
    def get_expired_subscriptions(db: Session) -> List[Subscription]:
        return db.query(Subscription).filter(
            Subscription.end_date < datetime.utcnow(),
            Subscription.is_active == True
        ).all()

    @staticmethod
    def deactivate_expired_subscriptions(db: Session) -> int:
        expired_subs = SubscriptionService.get_expired_subscriptions(db)
        count = 0
        for sub in expired_subs:
            sub.is_active = False
            count += 1
        db.commit()
        return count

# Background expiry and email alert logic
def run_expiry_and_alerts(db: Session):
    # Send warnings for subscriptions expiring soon
    expiring = SubscriptionService.get_expiring_subscriptions(db, days_ahead=3)
    for sub in expiring:
        days_left = (sub.end_date - datetime.utcnow()).days
        if days_left > 0:
            EmailService.send_expiry_warning(sub.user_email, sub.plan_name, days_left)

    # Deactivate expired subscriptions and send notifications
    expired = SubscriptionService.get_expired_subscriptions(db)
    for sub in expired:
        if sub.is_active:
            sub.is_active = False
            EmailService.send_expiry_notification(sub.user_email, sub.plan_name)
    db.commit()

# Scheduler setup (to be called from app startup)
def start_scheduler(db: Session):
    scheduler = BackgroundScheduler()
    scheduler.add_job(lambda: run_expiry_and_alerts(db), 'interval', hours=24)
    scheduler.start()

# Functional wrappers for API usage
def create_subscription(db: Session, create_data: SubscriptionCreate):
    sub = SubscriptionService.create_subscription(db, create_data)
    return sub

def update_subscription(db: Session, sub_id: int, update_data: SubscriptionUpdate):
    sub = SubscriptionService.update_subscription(db, sub_id, update_data)
    if not sub:
        raise Exception("Subscription not found")
    return sub

def renew_subscription(db: Session, sub_id: int):
    sub = SubscriptionService.renew_subscription(db, sub_id)
    if not sub:
        raise Exception("Subscription not found")
    return sub

def get_subscription_by_id(db: Session, sub_id: int):
    sub = SubscriptionService.get_subscription(db, sub_id)
    if not sub:
        raise Exception("Subscription not found")
    return sub

def check_subscription_status(db: Session, sub_id: int):
    sub = SubscriptionService.get_subscription(db, sub_id)
    if not sub:
        raise Exception("Subscription not found")
    return {"is_active": sub.is_active, "is_expired": sub.is_expired}