from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.database.models import (
    Employee, Incident, ResponseAction, AccountStatusEnum, User, RoleEnum
)
from app.services.audit import log_audit_event

class ResponseService:
    @staticmethod
    def execute_response_action(
        db: Session,
        actor: User,
        employee_id: int,
        action_type: str,
        reason: str,
        incident_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes a simulated IAM mitigation action outside the read-only monitoring enclave.
        Enforces human-in-the-loop validation and department RBAC.
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Target employee not found.")
            
        # Enforce Department Manager isolation
        if actor.role == RoleEnum.DEPARTMENT_MANAGER:
            if actor.department_id != employee.department_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access Denied: Department Managers can only execute responses on employees in their assigned department."
                )
        elif actor.role not in (RoleEnum.SUPER_ADMIN, RoleEnum.SECURITY_ANALYST):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to execute response actions."
            )
            
        action_upper = action_type.upper()
        prev_status = employee.account_status.value
        incident = db.query(Incident).filter(Incident.id == incident_id).first() if incident_id else None
        incident_code = incident.incident_code if incident else "MANUAL-RESPONSE"
        
        if action_upper == "RESTRICT":
            employee.account_status = AccountStatusEnum.RESTRICTED
            employee.current_status = "Access Restricted by Manager"
            new_status = AccountStatusEnum.RESTRICTED.value
            if incident:
                incident.status = "MITIGATED"
                
        elif action_upper == "REVOKE":
            employee.account_status = AccountStatusEnum.REVOKED
            employee.current_status = "Access Revoked (Security Containment)"
            new_status = AccountStatusEnum.REVOKED.value
            if incident:
                incident.status = "MITIGATED"
                
        elif action_upper == "RESTORE":
            employee.account_status = AccountStatusEnum.ACTIVE
            employee.current_status = "Normal / Restored"
            employee.risk_score = 15.0  # Reset active risk score to safe baseline
            new_status = AccountStatusEnum.ACTIVE.value
            if incident:
                incident.status = "CLOSED"
                incident.resolved_at = datetime.now(timezone.utc)
                
        elif action_upper == "INVESTIGATE":
            new_status = prev_status
            if incident:
                incident.status = "INVESTIGATING"
                incident.investigation_notes = (incident.investigation_notes or "") + f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {actor.full_name}: {reason}"
                
        elif action_upper == "ESCALATE":
            new_status = prev_status
            if incident:
                incident.status = "OPEN"
                incident.title = f"[ESCALATED] {incident.title}"
                incident.investigation_notes = (incident.investigation_notes or "") + f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M')}] ESCALATED by {actor.full_name}: {reason}"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported response action: {action_type}")
            
        # Record response action in IAM table
        action_record = ResponseAction(
            incident_id=incident_id,
            target_employee_id=employee.id,
            action_type=action_upper,
            previous_status=prev_status,
            new_status=new_status,
            reason=reason,
            executed_by_name=actor.full_name,
            executed_by_role=actor.role.value,
            is_simulated=True,
            executed_at=datetime.now(timezone.utc)
        )
        db.add(action_record)
        
        # Log to Immutable Audit Trail
        log_audit_event(
            db=db,
            actor_name=actor.full_name,
            actor_role=actor.role.value,
            action=f"IAM_{action_upper}_ACCESS",
            reason=reason,
            target_employee_code=employee.employee_code,
            target_employee_name=employee.name,
            department_name=employee.department.name if employee.department else None,
            incident_code=incident_code,
            previous_status=prev_status,
            new_status=new_status
        )
        
        db.commit()
        db.refresh(employee)
        
        return {
            "success": True,
            "action": action_upper,
            "target_employee": {
                "id": employee.id,
                "code": employee.employee_code,
                "name": employee.name,
                "department": employee.department.name if employee.department else None,
                "previous_status": prev_status,
                "new_status": new_status
            },
            "message": f"Successfully executed '{action_upper}' action for {employee.name}. Simulated IAM status updated to {new_status}."
        }
