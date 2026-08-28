from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Department, Employee, Alert, User, RoleEnum
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("")
def get_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    departments = db.query(Department).all()
    result = []
    
    for d in departments:
        emp_count = db.query(Employee).filter(Employee.department_id == d.id).count()
        alerts_count = db.query(Alert).filter(Alert.department_id == d.id, Alert.status == "NEW").count()
        
        # Calculate avg risk
        employees = db.query(Employee).filter(Employee.department_id == d.id).all()
        avg_risk = sum([e.risk_score for e in employees]) / max(1, len(employees)) if employees else 10.0
        
        result.append({
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "description": d.description,
            "manager_name": d.manager_name,
            "manager_email": d.manager_email,
            "employee_count": emp_count,
            "average_risk_score": round(avg_risk, 1),
            "active_threats_count": alerts_count
        })
    return result
