from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, RoleEnum
from app.auth.dependencies import get_current_user, require_roles
from app.response.service import ResponseService
from app.schemas.all_schemas import ResponseActionRequest

router = APIRouter(prefix="/response", tags=["Authorized IAM Response Layer"])

@router.post("/execute/{employee_id}")
def execute_iam_action(
    employee_id: int,
    payload: ResponseActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulates executing an authorized response action (RESTRICT, REVOKE, RESTORE, INVESTIGATE, ESCALATE).
    Enforces human-in-the-loop validation, department isolation, and logs to the immutable audit trail.
    """
    res = ResponseService.execute_response_action(
        db=db,
        actor=current_user,
        employee_id=employee_id,
        action_type=payload.action_type,
        reason=payload.reason,
        incident_id=payload.incident_id
    )
    return res

@router.post("/restrict/{employee_id}")
def restrict_access(
    employee_id: int,
    payload: ResponseActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payload.action_type = "RESTRICT"
    return ResponseService.execute_response_action(
        db=db,
        actor=current_user,
        employee_id=employee_id,
        action_type="RESTRICT",
        reason=payload.reason,
        incident_id=payload.incident_id
    )

@router.post("/revoke/{employee_id}")
def revoke_access(
    employee_id: int,
    payload: ResponseActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payload.action_type = "REVOKE"
    return ResponseService.execute_response_action(
        db=db,
        actor=current_user,
        employee_id=employee_id,
        action_type="REVOKE",
        reason=payload.reason,
        incident_id=payload.incident_id
    )

@router.post("/restore/{employee_id}")
def restore_access(
    employee_id: int,
    payload: ResponseActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payload.action_type = "RESTORE"
    return ResponseService.execute_response_action(
        db=db,
        actor=current_user,
        employee_id=employee_id,
        action_type="RESTRICT" if False else "RESTORE",
        reason=payload.reason,
        incident_id=payload.incident_id
    )
