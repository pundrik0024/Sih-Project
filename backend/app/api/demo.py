from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.session import get_db
from app.database.models import User, Employee, Department, SeverityEnum
from app.auth.dependencies import get_current_user
from app.services.simulator import simulator

router = APIRouter(prefix="/demo", tags=["Demo Center"])

@router.post("/run-scenario/{scenario_name}")
def run_demo_scenario(
    scenario_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    1-Click Guided Demo Runner:
    Triggers end-to-end attack simulation with full pipeline trace.
    """
    valid_scenarios = {
        "normal": "Normal Background Flow",
        "suspicious": "Unusual External Destination Flow",
        "data_exfiltration": "Data Exfiltration Attack (Finance Dept)",
        "brute_force": "Brute Force SSH Attack (IT Dept)",
        "port_scan": "Port Scan Reconnaissance"
    }
    
    if scenario_name not in valid_scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario. Choose from: {list(valid_scenarios.keys())}"
        )
        
    res = simulator.generate_flow_for_scenario(db, scenario_type=scenario_name)
    
    return {
        "status": "success",
        "scenario_name": valid_scenarios[scenario_name],
        "scenario_key": scenario_name,
        "pipeline_stages": [
            {"stage": 1, "name": "Mirrored Tap Ingestion", "status": "COMPLETED", "detail": "Flow captured via unidirectional mirror"},
            {"stage": 2, "name": "Feature Extraction", "status": "COMPLETED", "detail": "Extracted 14 numerical cybersecurity features"},
            {"stage": 3, "name": "AI Anomaly Detection", "status": "COMPLETED", "detail": f"Anomaly Score: {res['risk_evaluation']['factors']['ml_anomaly_score']}/100"},
            {"stage": 4, "name": "UEBA Baseline Deviation", "status": "COMPLETED", "detail": f"Deviation Score: {res['risk_evaluation']['factors']['behavior_deviation_score']}/100"},
            {"stage": 5, "name": "Explainable Risk Scoring", "status": "COMPLETED", "detail": f"Total Score: {res['risk_evaluation']['total_score']}/100 ({res['risk_evaluation']['severity'].value})"},
            {"stage": 6, "name": "Department Alert Routing", "status": "COMPLETED" if res['alert_created'] else "SKIPPED", "detail": f"Alert ID: {res['alert_id']}" if res['alert_created'] else "Low Risk - Logged"},
            {"stage": 7, "name": "IAM Response Ready", "status": "READY", "detail": res['risk_evaluation']['recommended_action']}
        ],
        "result": res
    }
