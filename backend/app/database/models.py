from datetime import datetime, timezone
import enum
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class RoleEnum(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER"
    EMPLOYEE = "EMPLOYEE"

class SeverityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AccountStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESTRICTED = "RESTRICTED"
    REVOKED = "REVOKED"

class ThreatTypeEnum(str, enum.Enum):
    NORMAL = "Normal Traffic"
    DATA_EXFILTRATION = "Data Exfiltration"
    BRUTE_FORCE = "Brute Force"
    PORT_SCANNING = "Port Scanning"
    ABNORMAL_OUTBOUND = "Abnormal Outbound Traffic"
    SUSPICIOUS_DESTINATION = "Suspicious External Destination"
    UNUSUAL_ACTIVITY = "Unusual Login/Activity"
    BOTNET_BEHAVIOR = "Botnet-like Behaviour"
    DOS_TRAFFIC = "Denial-of-Service-like Traffic"
    CREDENTIAL_MISUSE = "Credential Misuse"
    INSIDER_THREAT = "Insider Threat Indicator"

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    manager_name = Column(String(100), nullable=True)
    manager_email = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employees = relationship("Employee", back_populates="department", cascade="all, delete-orphan")
    users = relationship("User", back_populates="department")
    alerts = relationship("Alert", back_populates="department")
    incidents = relationship("Incident", back_populates="department")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.EMPLOYEE)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="users")
    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    role_title = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    account_status = Column(SAEnum(AccountStatusEnum), default=AccountStatusEnum.ACTIVE, nullable=False)
    device_id = Column(String(100), nullable=True)
    work_start_hour = Column(Integer, default=9)  # 09:00 AM
    work_end_hour = Column(Integer, default=18)   # 06:00 PM
    risk_score = Column(Float, default=10.0)
    current_status = Column(String(50), default="Normal")
    last_activity = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    previous_incidents_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employee")
    devices = relationship("Device", back_populates="employee")
    baseline = relationship("EmployeeBaseline", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    flows = relationship("NetworkFlow", back_populates="employee")
    risk_scores = relationship("RiskScore", back_populates="employee")
    alerts = relationship("Alert", back_populates="employee")
    incidents = relationship("Incident", back_populates="employee")

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_code = Column(String(50), unique=True, nullable=False, index=True)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(50), default="Workstation")  # Laptop, Workstation, Server, Mobile
    ip_address = Column(String(50), nullable=False)
    mac_address = Column(String(50), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    is_authorized = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="devices")

class EmployeeBaseline(Base):
    __tablename__ = "employee_baselines"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    avg_daily_bytes_sent = Column(Float, default=25000000.0)      # ~25 MB
    avg_daily_bytes_received = Column(Float, default=80000000.0)  # ~80 MB
    avg_connections_per_min = Column(Float, default=12.0)
    typical_protocols = Column(Text, default='["HTTPS", "DNS", "HTTP"]')
    common_destinations = Column(Text, default='["10.0.0.1", "10.0.1.5", "172.16.0.10"]')
    normal_work_hours = Column(String(50), default="09:00 - 18:00")
    typical_device_code = Column(String(50), nullable=True)
    max_normal_burst_bytes = Column(Float, default=50000000.0)    # ~50 MB burst
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="baseline")

class NetworkFlow(Base):
    __tablename__ = "network_flows"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    src_ip = Column(String(50), nullable=False)
    dst_ip = Column(String(50), nullable=False)
    src_port = Column(Integer, nullable=False)
    dst_port = Column(Integer, nullable=False)
    protocol = Column(String(20), nullable=False)
    packet_count = Column(Integer, default=1)
    bytes_sent = Column(Float, default=0.0)
    bytes_received = Column(Float, default=0.0)
    connection_duration = Column(Float, default=1.0)
    connections_per_min = Column(Float, default=5.0)
    upload_download_ratio = Column(Float, default=0.1)
    destination_reputation = Column(Float, default=1.0)  # 1.0 = Clean/Safe, 0.0 = Malicious
    is_external = Column(Boolean, default=False)
    device_id = Column(String(100), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    threat_type = Column(String(50), default=ThreatTypeEnum.NORMAL.value)
    is_anomaly = Column(Boolean, default=False)

    employee = relationship("Employee", back_populates="flows")
    risk_score = relationship("RiskScore", back_populates="flow", uselist=False)
    alerts = relationship("Alert", back_populates="flow")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("network_flows.id"), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    total_score = Column(Float, nullable=False)  # 0 - 100
    severity = Column(SAEnum(SeverityEnum), nullable=False)
    
    # 7-factor breakdown
    ml_anomaly_score = Column(Float, default=0.0)
    data_exfil_score = Column(Float, default=0.0)
    dst_anomaly_score = Column(Float, default=0.0)
    behavior_deviation_score = Column(Float, default=0.0)
    time_anomaly_score = Column(Float, default=0.0)
    device_anomaly_score = Column(Float, default=0.0)
    historical_risk_score = Column(Float, default=0.0)
    
    reasons_json = Column(Text, default="[]")
    explanation_summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    employee = relationship("Employee", back_populates="risk_scores")
    flow = relationship("NetworkFlow", back_populates="risk_score")

    @property
    def reasons(self):
        try:
            return json.loads(self.reasons_json)
        except Exception:
            return []

    @reasons.setter
    def reasons(self, value):
        self.reasons_json = json.dumps(value)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(SAEnum(SeverityEnum), nullable=False, index=True)
    threat_type = Column(String(100), default=ThreatTypeEnum.NORMAL.value)
    risk_score = Column(Float, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    flow_id = Column(Integer, ForeignKey("network_flows.id"), nullable=True)
    status = Column(String(50), default="NEW", index=True)  # NEW, ACKNOWLEDGED, RESOLVED
    assigned_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    routed_to = Column(String(255), default="Department Manager")
    acknowledged_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    employee = relationship("Employee", back_populates="alerts")
    department = relationship("Department", back_populates="alerts")
    flow = relationship("NetworkFlow", back_populates="alerts")
    incident = relationship("Incident", back_populates="alert", uselist=False)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(SAEnum(SeverityEnum), nullable=False, index=True)
    threat_type = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    status = Column(String(50), default="OPEN", index=True)  # OPEN, INVESTIGATING, MITIGATED, CLOSED
    assigned_manager_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    reasons_json = Column(Text, default="[]")
    recommended_action = Column(Text, nullable=True)
    investigation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    employee = relationship("Employee", back_populates="incidents")
    department = relationship("Department", back_populates="incidents")
    alert = relationship("Alert", back_populates="incident")
    response_actions = relationship("ResponseAction", back_populates="incident")

    @property
    def reasons(self):
        try:
            return json.loads(self.reasons_json)
        except Exception:
            return []

    @reasons.setter
    def reasons(self, value):
        self.reasons_json = json.dumps(value)

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    target_employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # RESTRICT, REVOKE, RESTORE, ESCALATE, INVESTIGATE
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    executed_by_name = Column(String(100), nullable=False)
    executed_by_role = Column(String(50), nullable=False)
    is_simulated = Column(Boolean, default=True)
    executed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    incident = relationship("Incident", back_populates="response_actions")
    employee = relationship("Employee")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_name = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    target_employee_code = Column(String(50), nullable=True)
    target_employee_name = Column(String(100), nullable=True)
    department_name = Column(String(100), nullable=True)
    incident_code = Column(String(50), nullable=True)
    reason = Column(Text, nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    confusion_matrix_json = Column(Text, default="[]")
    feature_importances_json = Column(Text, default="{}")
    trained_samples = Column(Integer, default=0)
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

class InAppNotification(Base):
    __tablename__ = "in_app_notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(SAEnum(SeverityEnum), default=SeverityEnum.MEDIUM)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
