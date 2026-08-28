from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from app.auth.dependencies import get_current_user
from app.database.models import User, RoleEnum
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("/config")
def get_system_config(current_user: User = Depends(get_current_user)):
    return {
        "project_name": settings.PROJECT_NAME,
        "database_type": "SQLite (Local Zero-Config)" if "sqlite" in settings.DATABASE_URL else "PostgreSQL",
        "monitoring_mode": "Unidirectional IP Read-Only Enclave",
        "weights": {
            "ml_anomaly": settings.WEIGHT_ML_ANOMALY,
            "data_exfiltration": settings.WEIGHT_DATA_EXFILTRATION,
            "destination_anomaly": settings.WEIGHT_DESTINATION_ANOMALY,
            "behavior_deviation": settings.WEIGHT_BEHAVIOR_DEVIATION,
            "time_anomaly": settings.WEIGHT_TIME_ANOMALY,
            "device_anomaly": settings.WEIGHT_DEVICE_ANOMALY,
            "historical_risk": settings.WEIGHT_HISTORICAL_RISK
        },
        "thresholds": {
            "low_max": settings.THRESHOLD_LOW_MAX,
            "medium_max": settings.THRESHOLD_MEDIUM_MAX,
            "high_max": settings.THRESHOLD_HIGH_MAX,
            "critical_min": settings.THRESHOLD_CRITICAL_MIN
        }
    }

@router.post("/weights")
def update_risk_weights(
    weights: Dict[str, float] = Body(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admins can modify risk weights.")
        
    settings.WEIGHT_ML_ANOMALY = weights.get("ml_anomaly", settings.WEIGHT_ML_ANOMALY)
    settings.WEIGHT_DATA_EXFILTRATION = weights.get("data_exfiltration", settings.WEIGHT_DATA_EXFILTRATION)
    settings.WEIGHT_DESTINATION_ANOMALY = weights.get("destination_anomaly", settings.WEIGHT_DESTINATION_ANOMALY)
    settings.WEIGHT_BEHAVIOR_DEVIATION = weights.get("behavior_deviation", settings.WEIGHT_BEHAVIOR_DEVIATION)
    settings.WEIGHT_TIME_ANOMALY = weights.get("time_anomaly", settings.WEIGHT_TIME_ANOMALY)
    settings.WEIGHT_DEVICE_ANOMALY = weights.get("device_anomaly", settings.WEIGHT_DEVICE_ANOMALY)
    settings.WEIGHT_HISTORICAL_RISK = weights.get("historical_risk", settings.WEIGHT_HISTORICAL_RISK)
    
    return {
        "status": "success",
        "message": "Risk factor weights updated successfully.",
        "new_weights": {
            "ml_anomaly": settings.WEIGHT_ML_ANOMALY,
            "data_exfiltration": settings.WEIGHT_DATA_EXFILTRATION,
            "destination_anomaly": settings.WEIGHT_DESTINATION_ANOMALY,
            "behavior_deviation": settings.WEIGHT_BEHAVIOR_DEVIATION,
            "time_anomaly": settings.WEIGHT_TIME_ANOMALY,
            "device_anomaly": settings.WEIGHT_DEVICE_ANOMALY,
            "historical_risk": settings.WEIGHT_HISTORICAL_RISK
        }
    }
