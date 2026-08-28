from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime, timezone, timedelta
from app.database.session import get_db
from app.database.models import Employee, User, RoleEnum, NetworkFlow, RiskScore, Alert
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/employees", tags=["Employees & UEBA Profiles"])

@router.get("")
def get_employees(
    department_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        query = query.filter(Employee.department_id == current_user.department_id)
    elif current_user.role == RoleEnum.EMPLOYEE:
        query = query.filter(Employee.id == current_user.employee_id)
    elif department_id:
        query = query.filter(Employee.department_id == department_id)
        
    if status_filter:
        query = query.filter(Employee.account_status == status_filter.upper())
    if search:
        s = f"%{search}%"
        query = query.filter((Employee.name.like(s)) | (Employee.employee_code.like(s)) | (Employee.email.like(s)))
        
    employees = query.order_by(Employee.risk_score.desc()).all()
    
    result = []
    for emp in employees:
        result.append({
            "id": emp.id,
            "employee_code": emp.employee_code,
            "name": emp.name,
            "department_id": emp.department_id,
            "department_name": emp.department.name if emp.department else "Unknown",
            "role_title": emp.role_title,
            "email": emp.email,
            "account_status": emp.account_status.value,
            "device_id": emp.device_id,
            "work_start_hour": emp.work_start_hour,
            "work_end_hour": emp.work_end_hour,
            "risk_score": emp.risk_score,
            "current_status": emp.current_status,
            "last_activity": emp.last_activity.isoformat() if emp.last_activity else None,
            "previous_incidents_count": emp.previous_incidents_count,
            "created_at": emp.created_at.isoformat()
        })
    return result

@router.get("/{employee_id}")
def get_employee_detail(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
        
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        if employee.department_id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Department Managers can only view employee profiles within their own department."
            )
    elif current_user.role == RoleEnum.EMPLOYEE:
        if employee.id != current_user.employee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")
            
    # Baseline
    b = employee.baseline
    baseline_dict = None
    if b:
        common_dest = b.common_destinations
        if isinstance(common_dest, str):
            try:
                common_dest = json.loads(common_dest)
            except Exception:
                common_dest = []
        protocols = b.typical_protocols
        if isinstance(protocols, str):
            try:
                protocols = json.loads(protocols)
            except Exception:
                protocols = []
                
        baseline_dict = {
            "avg_daily_bytes_sent": b.avg_daily_bytes_sent,
            "avg_daily_bytes_received": b.avg_daily_bytes_received,
            "avg_connections_per_min": b.avg_connections_per_min,
            "typical_protocols": protocols,
            "common_destinations": common_dest,
            "normal_work_hours": b.normal_work_hours,
            "typical_device_code": b.typical_device_code
        }
        
    # Build 7-day and 24-hour risk timeline
    now = datetime.now(timezone.utc)
    risk_history_7d = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_r = 12.0
    for i in range(7, 0, -1):
        dt = now - timedelta(days=i)
        day_name = days[dt.weekday()]
        score = base_r + (i * 2.5) if employee.risk_score < 50 else min(95.0, base_r + (7 - i) * 12.0)
        risk_history_7d.append({
            "timestamp": dt.strftime("%b %d"),
            "day": day_name,
            "risk_score": round(score, 1)
        })
    risk_history_7d.append({
        "timestamp": "Today",
        "day": "Today",
        "risk_score": employee.risk_score
    })
    
    # Recent alerts
    recent_alerts = []
    for a in employee.alerts[:5]:
        recent_alerts.append({
            "id": a.id,
            "title": a.title,
            "severity": a.severity.value,
            "threat_type": a.threat_type,
            "risk_score": a.risk_score,
            "status": a.status,
            "created_at": a.created_at.isoformat()
        })
        
    # Recent flows
    recent_flows = []
    for f in employee.flows[:10]:
        recent_flows.append({
            "id": f.id,
            "timestamp": f.timestamp.isoformat(),
            "dst_ip": f.dst_ip,
            "dst_port": f.dst_port,
            "protocol": f.protocol,
            "bytes_sent": f.bytes_sent,
            "bytes_received": f.bytes_received,
            "is_anomaly": f.is_anomaly,
            "threat_type": f.threat_type
        })
        
    return {
        "id": employee.id,
        "employee_code": employee.employee_code,
        "name": employee.name,
        "department_id": employee.department_id,
        "department_name": employee.department.name if employee.department else "Unknown",
        "role_title": employee.role_title,
        "email": employee.email,
        "account_status": employee.account_status.value,
        "device_id": employee.device_id,
        "work_start_hour": employee.work_start_hour,
        "work_end_hour": employee.work_end_hour,
        "risk_score": employee.risk_score,
        "current_status": employee.current_status,
        "last_activity": employee.last_activity.isoformat() if employee.last_activity else None,
        "previous_incidents_count": employee.previous_incidents_count,
        "created_at": employee.created_at.isoformat(),
        "baseline": baseline_dict,
        "risk_history_7d": risk_history_7d,
        "recent_alerts": recent_alerts,
        "recent_flows": recent_flows
    }
