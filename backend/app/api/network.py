from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database.session import get_db
from app.database.models import NetworkFlow, User, RoleEnum, Employee
from app.auth.dependencies import get_current_user
from app.services.simulator import simulator
from app.schemas.all_schemas import FlowSchema, ScenarioRequest

router = APIRouter(prefix="/network", tags=["Network Monitor"])

@router.get("/flows")
def get_network_flows(
    limit: int = Query(50, ge=1, le=500),
    threat_only: bool = Query(False),
    protocol: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(NetworkFlow).join(Employee)
    
    # Department Manager Isolation
    if current_user.role == RoleEnum.DEPARTMENT_MANAGER:
        query = query.filter(Employee.department_id == current_user.department_id)
    elif current_user.role == RoleEnum.EMPLOYEE:
        query = query.filter(Employee.id == current_user.employee_id)
        
    if threat_only:
        query = query.filter(NetworkFlow.is_anomaly == True)
    if protocol:
        query = query.filter(NetworkFlow.protocol == protocol.upper())
        
    flows = query.order_by(NetworkFlow.timestamp.desc()).limit(limit).all()
    
    result = []
    for f in flows:
        result.append({
            "id": f.id,
            "timestamp": f.timestamp.isoformat(),
            "src_ip": f.src_ip,
            "dst_ip": f.dst_ip,
            "src_port": f.src_port,
            "dst_port": f.dst_port,
            "protocol": f.protocol,
            "packet_count": f.packet_count,
            "bytes_sent": f.bytes_sent,
            "bytes_received": f.bytes_received,
            "connection_duration": f.connection_duration,
            "connections_per_min": f.connections_per_min,
            "upload_download_ratio": f.upload_download_ratio,
            "destination_reputation": f.destination_reputation,
            "is_external": f.is_external,
            "device_id": f.device_id,
            "employee_id": f.employee_id,
            "employee_name": f.employee.name if f.employee else None,
            "department_name": f.employee.department.name if f.employee and f.employee.department else None,
            "threat_type": f.threat_type,
            "is_anomaly": f.is_anomaly
        })
    return result

@router.post("/simulate/tick")
def trigger_simulator_tick(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generates a random normal flow tick
    res = simulator.generate_flow_for_scenario(db, scenario_type="normal")
    return {"status": "success", "result": res}

@router.post("/trigger-scenario")
def trigger_scenario(
    payload: ScenarioRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = simulator.generate_flow_for_scenario(
        db,
        scenario_type=payload.scenario,
        employee_id=payload.employee_id
    )
    return {
        "status": "success",
        "scenario": payload.scenario,
        "result": res
    }
