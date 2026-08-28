from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
from app.auth.dependencies import get_current_user
from app.database.models import User, RoleEnum
from app.ml.model_manager import model_manager

router = APIRouter(prefix="/ml", tags=["Machine Learning Engine"])

@router.get("/status")
def get_model_status(current_user: User = Depends(get_current_user)):
    return {
        "is_loaded": model_manager.is_loaded,
        "metrics": model_manager.metrics,
        "models": {
            "anomaly_detector": "Isolation Forest (Unsupervised)",
            "threat_classifier": "Random Forest Classifier (Supervised Multi-Class)",
            "scaler": "StandardScaler"
        },
        "disclaimer": "Prototype model trained using synthetic/labeled network-flow dataset."
    }

@router.post("/retrain")
def retrain_models(current_user: User = Depends(get_current_user)):
    if current_user.role not in (RoleEnum.SUPER_ADMIN, RoleEnum.SECURITY_ANALYST):
        raise HTTPException(status_code=403, detail="Only Security Admins can trigger model retraining.")
        
    model_manager.load_models(force_retrain=True)
    return {
        "status": "success",
        "message": "AI Models retrained and reloaded successfully.",
        "metrics": model_manager.metrics
    }

@router.post("/predict")
def test_predict(
    flow_payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    res = model_manager.predict(flow_payload)
    return {
        "status": "success",
        "prediction": res
    }
