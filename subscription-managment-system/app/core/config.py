from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    
    class Config:
        env_file = ".env"

settings = Settings()