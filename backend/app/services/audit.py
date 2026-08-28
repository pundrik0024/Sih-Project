from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.database.models import AuditLog

def log_audit_event(
    db: Session,
    actor_name: str,
    actor_role: str,
    action: str,
    reason: str,
    target_employee_code: Optional[str] = None,
    target_employee_name: Optional[str] = None,
    department_name: Optional[str] = None,
    incident_code: Optional[str] = None,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    """
    Creates an immutable audit log record for every critical response or configuration action.
    """
    audit_entry = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        target_employee_code=target_employee_code,
        target_employee_name=target_employee_name,
        department_name=department_name,
        incident_code=incident_code,
        reason=reason,
        previous_status=previous_status,
        new_status=new_status,
        ip_address=ip_address,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
