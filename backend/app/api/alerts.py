from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database.session import get_db
from app.database.models import Alert, User, RoleEnum, Employee, SeverityEnum
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Employee)
    
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        query = query.filter(Alert.department_id == current_user.department_id)
    elif current_user.role == RoleEnum.EMPLOYEE:
        query = query.filter(Alert.employee_id == current_user.employee_id)
        
    if severity:
        try:
            sev_enum = SeverityEnum(severity.upper())
            query = query.filter(Alert.severity == sev_enum)
        except ValueError:
            pass
            
    if status_filter:
        query = query.filter(Alert.status == status_filter.upper())
        
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    
    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "title": a.title,
            "severity": a.severity.value,
            "threat_type": a.threat_type,
            "risk_score": a.risk_score,
            "employee_id": a.employee_id,
            "employee_name": a.employee.name if a.employee else "Unknown",
            "department_id": a.department_id,
            "department_name": a.department.name if a.department else "Unknown",
            "flow_id": a.flow_id,
            "status": a.status,
            "routed_to": a.routed_to,
            "created_at": a.created_at.isoformat(),
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            "incident_id": a.incident.id if a.incident else None,
            "incident_code": a.incident.incident_code if a.incident else None
        })
    return result

@router.get("/{alert_id}")
def get_alert_detail(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        if alert.department_id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You do not have permission to view alerts outside your department."
            )
    elif current_user.role == RoleEnum.EMPLOYEE:
        if alert.employee_id != current_user.employee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")
            
    risk_record = alert.employee.risk_scores[-1] if alert.employee and alert.employee.risk_scores else None
    
    return {
        "id": alert.id,
        "title": alert.title,
        "severity": alert.severity.value,
        "threat_type": alert.threat_type,
        "risk_score": alert.risk_score,
        "employee_id": alert.employee_id,
        "employee_name": alert.employee.name if alert.employee else "Unknown",
        "employee_code": alert.employee.employee_code if alert.employee else "N/A",
        "department_id": alert.department_id,
        "department_name": alert.department.name if alert.department else "Unknown",
        "status": alert.status,
        "routed_to": alert.routed_to,
        "created_at": alert.created_at.isoformat(),
        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "incident_id": alert.incident.id if alert.incident else None,
        "flow": {
            "src_ip": alert.flow.src_ip if alert.flow else "N/A",
            "dst_ip": alert.flow.dst_ip if alert.flow else "N/A",
            "protocol": alert.flow.protocol if alert.flow else "TCP",
            "bytes_sent": alert.flow.bytes_sent if alert.flow else 0,
            "bytes_received": alert.flow.bytes_received if alert.flow else 0,
            "duration": alert.flow.connection_duration if alert.flow else 0,
            "device_id": alert.flow.device_id if alert.flow else None
        } if alert.flow else None,
        "risk_breakdown": {
            "ml_anomaly_score": risk_record.ml_anomaly_score if risk_record else 0,
            "data_exfil_score": risk_record.data_exfil_score if risk_record else 0,
            "dst_anomaly_score": risk_record.dst_anomaly_score if risk_record else 0,
            "behavior_deviation_score": risk_record.behavior_deviation_score if risk_record else 0,
            "time_anomaly_score": risk_record.time_anomaly_score if risk_record else 0,
            "device_anomaly_score": risk_record.device_anomaly_score if risk_record else 0,
            "historical_risk_score": risk_record.historical_risk_score if risk_record else 0,
        } if risk_record else {},
        "reasons": risk_record.reasons if risk_record else [],
        "recommended_action": risk_record.recommended_action if risk_record else "Review security profile."
    }

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER and alert.department_id != current_user.department_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")
        
    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_by_id = current_user.id
    alert.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as Acknowledged."}
