import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisGuard SOC - Cyber Threat Detection & Response Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aegisguard-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cyber_threat_platform.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # ML & Risk Scoring Weights (Total = 1.0)
    WEIGHT_ML_ANOMALY: float = 0.30
    WEIGHT_DATA_EXFILTRATION: float = 0.20
    WEIGHT_DESTINATION_ANOMALY: float = 0.15
    WEIGHT_BEHAVIOR_DEVIATION: float = 0.15
    WEIGHT_TIME_ANOMALY: float = 0.05
    WEIGHT_DEVICE_ANOMALY: float = 0.05
    WEIGHT_HISTORICAL_RISK: float = 0.10
    
    # Risk Score Thresholds
    THRESHOLD_LOW_MAX: int = 30
    THRESHOLD_MEDIUM_MAX: int = 60
    THRESHOLD_HIGH_MAX: int = 80
    THRESHOLD_CRITICAL_MIN: int = 81
    
    # Demo and Models Path
    MODELS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
