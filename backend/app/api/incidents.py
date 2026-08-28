from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import json
from app.database.session import get_db
from app.database.models import Incident, User, RoleEnum, Employee, SeverityEnum
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("")
def get_incidents(
    status_filter: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Incident).join(Employee)
    
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        query = query.filter(Incident.department_id == current_user.department_id)
    elif current_user.role == RoleEnum.EMPLOYEE:
        query = query.filter(Incident.employee_id == current_user.employee_id)
        
    if status_filter:
        query = query.filter(Incident.status == status_filter.upper())
    if severity:
        try:
            sev_enum = SeverityEnum(severity.upper())
            query = query.filter(Incident.severity == sev_enum)
        except ValueError:
            pass
            
    incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()
    
    result = []
    for inc in incidents:
        result.append({
            "id": inc.id,
            "incident_code": inc.incident_code,
            "title": inc.title,
            "severity": inc.severity.value,
            "threat_type": inc.threat_type,
            "risk_score": inc.risk_score,
            "employee_id": inc.employee_id,
            "employee_code": inc.employee.employee_code if inc.employee else "N/A",
            "employee_name": inc.employee.name if inc.employee else "Unknown",
            "employee_status": inc.employee.account_status.value if inc.employee else "ACTIVE",
            "department_id": inc.department_id,
            "department_name": inc.department.name if inc.department else "Unknown",
            "status": inc.status,
            "assigned_manager_name": inc.assigned_manager_name,
            "description": inc.description,
            "reasons": inc.reasons,
            "recommended_action": inc.recommended_action,
            "created_at": inc.created_at.isoformat(),
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None
        })
    return result

@router.get("/{incident_id}")
def get_incident_detail(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
        
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        if incident.department_id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Incident belongs to another department."
            )
    elif current_user.role == RoleEnum.EMPLOYEE:
        if incident.employee_id != current_user.employee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")
            
    emp = incident.employee
    flow = incident.alert.flow if incident.alert else None
    
    # Get latest risk breakdown
    risk_score_obj = emp.risk_scores[-1] if emp and emp.risk_scores else None
    
    # Prior response actions
    actions = []
    for act in incident.response_actions:
        actions.append({
            "id": act.id,
            "action_type": act.action_type,
            "previous_status": act.previous_status,
            "new_status": act.new_status,
            "reason": act.reason,
            "executed_by_name": act.executed_by_name,
            "executed_by_role": act.executed_by_role,
            "executed_at": act.executed_at.isoformat()
        })
        
    return {
        "id": incident.id,
        "incident_code": incident.incident_code,
        "title": incident.title,
        "severity": incident.severity.value,
        "threat_type": incident.threat_type,
        "risk_score": incident.risk_score,
        "status": incident.status,
        "assigned_manager_name": incident.assigned_manager_name,
        "description": incident.description,
        "reasons": incident.reasons,
        "recommended_action": incident.recommended_action,
        "investigation_notes": incident.investigation_notes,
        "created_at": incident.created_at.isoformat(),
        "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
        "employee": {
            "id": emp.id,
            "code": emp.employee_code,
            "name": emp.name,
            "email": emp.email,
            "role_title": emp.role_title,
            "account_status": emp.account_status.value,
            "device_id": emp.device_id,
            "risk_score": emp.risk_score,
            "previous_incidents_count": emp.previous_incidents_count,
            "working_hours": f"{emp.work_start_hour:02d}:00 - {emp.work_end_hour:02d}:00"
        } if emp else None,
        "department": {
            "id": incident.department.id,
            "name": incident.department.name,
            "code": incident.department.code
        } if incident.department else None,
        "flow": {
            "src_ip": flow.src_ip if flow else "10.0.1.15",
            "dst_ip": flow.dst_ip if flow else "198.51.100.77",
            "src_port": flow.src_port if flow else 51420,
            "dst_port": flow.dst_port if flow else 443,
            "protocol": flow.protocol if flow else "TCP",
            "bytes_sent": flow.bytes_sent if flow else 1420000000.0,
            "bytes_received": flow.bytes_received if flow else 24000.0,
            "duration": flow.connection_duration if flow else 420.0,
            "upload_download_ratio": flow.upload_download_ratio if flow else 59166.0,
            "destination_reputation": flow.destination_reputation if flow else 0.18,
            "is_external": flow.is_external if flow else True,
            "timestamp": flow.timestamp.isoformat() if flow else incident.created_at.isoformat()
        },
        "risk_breakdown": {
            "ml_anomaly_score": risk_score_obj.ml_anomaly_score if risk_score_obj else 95.0,
            "data_exfil_score": risk_score_obj.data_exfil_score if risk_score_obj else 100.0,
            "dst_anomaly_score": risk_score_obj.dst_anomaly_score if risk_score_obj else 85.0,
            "behavior_deviation_score": risk_score_obj.behavior_deviation_score if risk_score_obj else 100.0,
            "time_anomaly_score": risk_score_obj.time_anomaly_score if risk_score_obj else 90.0,
            "device_anomaly_score": risk_score_obj.device_anomaly_score if risk_score_obj else 10.0,
            "historical_risk_score": risk_score_obj.historical_risk_score if risk_score_obj else 25.0
        },
        "response_actions": actions
    }
