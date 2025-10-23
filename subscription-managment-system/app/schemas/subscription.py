from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class SubscriptionCreate(BaseModel):
    user_email: EmailStr
    plan_name: str
    end_date: datetime

class SubscriptionUpdate(BaseModel):
    plan_name: Optional[str] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class SubscriptionResponse(BaseModel):
    id: int
    user_email: str
    plan_name: str
    start_date: datetime
    end_date: datetime
    is_active: bool
    is_expired: bool
    
    class Config:
        from_attributes = True