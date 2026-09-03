from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models import AuditLog, User, RoleEnum
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("")
def get_audit_logs(
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only Admin, Analyst, and Department Manager can view audit logs
    # Department manager can only see logs relevant to their department
    if current_user.role == RoleEnum.EMPLOYEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Employees cannot view system audit logs."
        )
        
    query = db.query(AuditLog)
    
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        dept_name = current_user.department.name if current_user.department else None
        query = query.filter(AuditLog.department_name == dept_name)
        
    if search:
        s = f"%{search}%"
        query = query.filter(
            (AuditLog.actor_name.like(s)) |
            (AuditLog.target_employee_name.like(s)) |
            (AuditLog.action.like(s)) |
            (AuditLog.reason.like(s))
        )
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    result = []
    for l in logs:
        result.append({
            "id": l.id,
            "actor_name": l.actor_name,
            "actor_role": l.actor_role,
            "action": l.action,
            "target_employee_code": l.target_employee_code,
            "target_employee_name": l.target_employee_name,
            "department_name": l.department_name,
            "incident_code": l.incident_code,
            "reason": l.reason,
            "previous_status": l.previous_status,
            "new_status": l.new_status,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        })
    return result
