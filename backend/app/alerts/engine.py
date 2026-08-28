import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import (
    Alert, Incident, InAppNotification, Employee, Department, User, RoleEnum, SeverityEnum, NetworkFlow
)

def route_and_create_alert(
    db: Session,
    risk_evaluation: Dict[str, Any],
    flow: NetworkFlow,
    employee: Employee
) -> Optional[Alert]:
    """
    Creates Alert and Incident (if High/Critical), and notifies authorized parties:
    - LOW: Logged only.
    - MEDIUM: Department Manager in-app notification.
    - HIGH: Department Manager + Security Team.
    - CRITICAL: Department Manager + Security Team + Security Administrator.
    """
    severity = risk_evaluation["severity"]
    risk_score = risk_evaluation["total_score"]
    
    # Do not create active alert for LOW severity (standard baseline log)
    if severity == SeverityEnum.LOW and risk_score < 30.0:
        return None
        
    threat_type = flow.threat_type or "Suspicious Activity"
    dept = employee.department
    
    # Determine routing targets description
    if severity == SeverityEnum.CRITICAL:
        routed_to = f"{dept.name} Manager, SOC Security Team, Security Administrator"
    elif severity == SeverityEnum.HIGH:
        routed_to = f"{dept.name} Manager, SOC Security Team"
    else:
        routed_to = f"{dept.name} Manager"
        
    alert_title = f"{severity.value} Risk Anomaly Detected: {threat_type} ({employee.name})"
    
    # 1. Create Alert record
    alert = Alert(
        title=alert_title,
        severity=severity,
        threat_type=threat_type,
        risk_score=risk_score,
        employee_id=employee.id,
        department_id=dept.id,
        flow_id=flow.id,
        status="NEW",
        routed_to=routed_to,
        created_at=datetime.now(timezone.utc)
    )
    db.add(alert)
    db.flush()
    
    # 2. Create Incident record for HIGH / CRITICAL alerts
    if severity in (SeverityEnum.HIGH, SeverityEnum.CRITICAL):
        incident_code = f"INC-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        reasons_list = risk_evaluation.get("reasons", [])
        
        incident = Incident(
            incident_code=incident_code,
            title=f"Security Incident: {threat_type} by {employee.name} ({dept.name})",
            severity=severity,
            threat_type=threat_type,
            risk_score=risk_score,
            employee_id=employee.id,
            department_id=dept.id,
            alert_id=alert.id,
            status="OPEN",
            assigned_manager_name=dept.manager_name or f"{dept.name} Manager",
            description=risk_evaluation.get("explanation_summary", "Anomaly detected during unidirectional traffic analysis."),
            reasons_json=json.dumps(reasons_list),
            recommended_action=risk_evaluation.get("recommended_action", "Investigate and restrict access."),
            created_at=datetime.now(timezone.utc)
        )
        db.add(incident)
        
        # Increment employee previous incidents counter
        employee.previous_incidents_count = (employee.previous_incidents_count or 0) + 1
        
    # 3. Create In-App Notifications for authorized roles
    # Notify Department Manager
    dept_mgr_user = db.query(User).filter(
        User.department_id == dept.id,
        User.role == RoleEnum.DEPARTMENT_MANAGER
    ).first()
    
    if dept_mgr_user:
        notif = InAppNotification(
            recipient_user_id=dept_mgr_user.id,
            department_id=dept.id,
            title=f"[{severity.value}] Alert in your department: {employee.name}",
            message=f"Risk Score {risk_score:.0f}/100: {risk_evaluation.get('explanation_summary', alert_title)}",
            severity=severity,
            alert_id=alert.id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notif)
        
    # Notify Security Admins / Analysts for High/Critical
    if severity in (SeverityEnum.HIGH, SeverityEnum.CRITICAL):
        sec_users = db.query(User).filter(
            User.role.in_([RoleEnum.SUPER_ADMIN, RoleEnum.SECURITY_ANALYST])
        ).all()
        for sec_user in sec_users:
            notif = InAppNotification(
                recipient_user_id=sec_user.id,
                department_id=None,
                title=f"[{severity.value}] Threat Incident: {dept.name} - {employee.name}",
                message=f"Risk Score {risk_score:.0f}/100: {threat_type} detected. Recommended: {risk_evaluation.get('recommended_action')}",
                severity=severity,
                alert_id=alert.id,
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)
            
    db.commit()
    db.refresh(alert)
    return alert
