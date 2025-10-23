from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.subscription import Subscription
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.database.connection import get_db
from app.services.subscription_service import (
    create_subscription,
    update_subscription,
    renew_subscription,
    get_subscription_by_id,
    check_subscription_status
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.post("/", response_model=SubscriptionResponse)
def create_sub(create_data: SubscriptionCreate, db: Session = Depends(get_db)):
    return create_subscription(db, create_data)

@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update_sub(sub_id: int, update_data: SubscriptionUpdate, db: Session = Depends(get_db)):
    return update_subscription(db, sub_id, update_data)

@router.post("/{sub_id}/renew", response_model=SubscriptionResponse)
def renew_sub(sub_id: int, db: Session = Depends(get_db)):
    return renew_subscription(db, sub_id)

@router.get("/{sub_id}", response_model=SubscriptionResponse)
def get_sub(sub_id: int, db: Session = Depends(get_db)):
    return get_subscription_by_id(db, sub_id)

@router.get("/{sub_id}/status")
def check_status(sub_id: int, db: Session = Depends(get_db)):
    return check_subscription_status(db, sub_id)
