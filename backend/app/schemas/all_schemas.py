from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Dashboard
class DashboardSummary(BaseModel):
    total_network_flows: int
    active_employees: int
    threats_detected: int
    critical_alerts: int
    high_risk_users: int
    currently_restricted_users: int
    risk_overview: Dict[str, int]  # {"low": 12, "medium": 5, "high": 2, "critical": 1}
    severity_distribution: Dict[str, int]
    traffic_metrics: Dict[str, Any]
    threats_by_type: List[Dict[str, Any]]
    threats_by_department: List[Dict[str, Any]]
    recent_alerts: List[Dict[str, Any]]

# Network Flow
class FlowSchema(BaseModel):
    id: int
    timestamp: datetime
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    packet_count: int
    bytes_sent: float
    bytes_received: float
    connection_duration: float
    connections_per_min: float
    upload_download_ratio: float
    destination_reputation: float
    is_external: bool
    device_id: Optional[str] = None
    employee_id: Optional[int] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    threat_type: str
    is_anomaly: bool

    class Config:
        from_attributes = True

# Risk Score
class RiskFactorBreakdown(BaseModel):
    ml_anomaly_score: float
    data_exfil_score: float
    dst_anomaly_score: float
    behavior_deviation_score: float
    time_anomaly_score: float
    device_anomaly_score: float
    historical_risk_score: float

class RiskScoreSchema(BaseModel):
    id: int
    total_score: float
    severity: str
    factors: RiskFactorBreakdown
    reasons: List[str]
    explanation_summary: Optional[str] = None
    recommended_action: Optional[str] = None
    timestamp: datetime

# Alert
class AlertSchema(BaseModel):
    id: int
    title: str
    severity: str
    threat_type: str
    risk_score: float
    employee_id: int
    employee_name: str
    department_id: int
    department_name: str
    flow_id: Optional[int] = None
    status: str
    routed_to: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Incident
class IncidentSchema(BaseModel):
    id: int
    incident_code: str
    title: str
    severity: str
    threat_type: str
    risk_score: float
    employee_id: int
    employee_code: str
    employee_name: str
    department_id: int
    department_name: str
    status: str
    assigned_manager_name: Optional[str] = None
    description: Optional[str] = None
    reasons: List[str]
    recommended_action: Optional[str] = None
    investigation_notes: Optional[str] = None
    risk_breakdown: Optional[Dict[str, float]] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Employee
class EmployeeBaselineSchema(BaseModel):
    avg_daily_bytes_sent: float
    avg_daily_bytes_received: float
    avg_connections_per_min: float
    typical_protocols: Any
    common_destinations: Any
    normal_work_hours: str
    typical_device_code: Optional[str] = None

class EmployeeSchema(BaseModel):
    id: int
    employee_code: str
    name: str
    department_id: int
    department_name: str
    role_title: str
    email: str
    account_status: str
    device_id: Optional[str] = None
    work_start_hour: int
    work_end_hour: int
    risk_score: float
    current_status: str
    last_activity: datetime
    previous_incidents_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeDetailSchema(EmployeeSchema):
    baseline: Optional[EmployeeBaselineSchema] = None
    risk_history_24h: List[Dict[str, Any]] = []
    risk_history_7d: List[Dict[str, Any]] = []
    recent_alerts: List[AlertSchema] = []
    recent_flows: List[FlowSchema] = []

# Department
class DepartmentSchema(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    manager_name: Optional[str] = None
    manager_email: Optional[str] = None
    employee_count: int = 0
    average_risk_score: float = 0.0
    active_threats_count: int = 0

    class Config:
        from_attributes = True

# Response Action Request
class ResponseActionRequest(BaseModel):
    action_type: str = Field(..., description="RESTRICT, REVOKE, RESTORE, INVESTIGATE, ESCALATE")
    reason: str = Field(..., min_length=5, description="Mandatory reason for audit trail")
    incident_id: Optional[int] = None

# Audit Log
class AuditLogSchema(BaseModel):
    id: int
    actor_name: str
    actor_role: str
    action: str
    target_employee_code: Optional[str] = None
    target_employee_name: Optional[str] = None
    department_name: Optional[str] = None
    incident_code: Optional[str] = None
    reason: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Scenario Simulation Request
class ScenarioRequest(BaseModel):
    scenario: str = Field(..., description="normal, suspicious, data_exfiltration, brute_force, port_scan")
    employee_id: Optional[int] = None
