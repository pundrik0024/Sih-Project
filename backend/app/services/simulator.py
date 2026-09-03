import random
import time
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import (
    Employee, EmployeeBaseline, NetworkFlow, RiskScore, Device,
    Department, ThreatTypeEnum, SeverityEnum
)
from app.ml.model_manager import model_manager
from app.risk.baseline import compare_flow_with_baseline
from app.risk.engine import calculate_explainable_risk
from app.alerts.engine import route_and_create_alert

class NetworkTrafficSimulator:
    _instance = None
    
    def __init__(self):
        self.is_running = False
        self.simulation_speed = 1.0  # seconds between ticks
        self.flows_generated_count = 0
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = NetworkTrafficSimulator()
        return cls._instance
        
    def process_and_ingest_flow(self, db: Session, flow_data: Dict[str, Any], employee: Employee) -> Dict[str, Any]:
        """
        Core Ingestion Pipeline (Read-Only Monitoring Enclave):
        1. Receive mirrored flow
        2. Retrieve employee baseline
        3. Run AI Anomaly & Threat Classification models
        4. Run UEBA Baseline Comparator
        5. Run Explainable Risk Scoring Engine
        6. Store NetworkFlow and RiskScore
        7. If threshold crossed, route Alert to authorized Department Manager & SOC
        """
        baseline = employee.baseline
        
        # 1. AI Detection
        baseline_dict = {
            "avg_daily_bytes_sent": baseline.avg_daily_bytes_sent if baseline else 25000000.0,
            "common_destinations": baseline.common_destinations if baseline else "[]",
            "typical_device_code": baseline.typical_device_code if baseline else None
        }
        ml_prediction = model_manager.predict(flow_data, baseline_dict)
        
        # 2. UEBA Baseline Comparison
        baseline_comparison = compare_flow_with_baseline(flow_data, baseline, employee)
        
        # 3. Explainable Risk Score
        risk_eval = calculate_explainable_risk(ml_prediction, baseline_comparison, flow_data, employee)
        
        # 4. Save Network Flow
        flow_obj = NetworkFlow(
            timestamp=flow_data.get("timestamp", datetime.now(timezone.utc)),
            src_ip=flow_data.get("src_ip", "10.0.1.15"),
            dst_ip=flow_data.get("dst_ip", "198.51.100.22"),
            src_port=flow_data.get("src_port", 49152),
            dst_port=flow_data.get("dst_port", 443),
            protocol=flow_data.get("protocol", "TCP"),
            packet_count=flow_data.get("packet_count", 10),
            bytes_sent=flow_data.get("bytes_sent", 1500.0),
            bytes_received=flow_data.get("bytes_received", 35000.0),
            connection_duration=flow_data.get("connection_duration", 1.2),
            connections_per_min=flow_data.get("connections_per_minute", 6.0),
            upload_download_ratio=flow_data.get("upload_download_ratio", 0.04),
            destination_reputation=flow_data.get("destination_reputation", 0.95),
            is_external=flow_data.get("is_external", True),
            device_id=flow_data.get("device_id", employee.device_id),
            employee_id=employee.id,
            threat_type=ml_prediction.get("predicted_threat", ThreatTypeEnum.NORMAL.value),
            is_anomaly=ml_prediction.get("is_anomaly", False)
        )
        db.add(flow_obj)
        db.flush()
        
        # 5. Save Risk Score Record
        factors = risk_eval["factors"]
        risk_obj = RiskScore(
            flow_id=flow_obj.id,
            employee_id=employee.id,
            total_score=risk_eval["total_score"],
            severity=risk_eval["severity"],
            ml_anomaly_score=factors["ml_anomaly_score"],
            data_exfil_score=factors["data_exfil_score"],
            dst_anomaly_score=factors["dst_anomaly_score"],
            behavior_deviation_score=factors["behavior_deviation_score"],
            time_anomaly_score=factors["time_anomaly_score"],
            device_anomaly_score=factors["device_anomaly_score"],
            historical_risk_score=factors["historical_risk_score"],
            reasons_json=json.dumps(risk_eval["reasons"]),
            explanation_summary=risk_eval["explanation_summary"],
            recommended_action=risk_eval["recommended_action"],
            timestamp=datetime.now(timezone.utc)
        )
        db.add(risk_obj)
        
        # Update employee live risk score & last activity
        employee.risk_score = risk_eval["total_score"]
        employee.last_activity = datetime.now(timezone.utc)
        
        # 6. Route Alerts if applicable
        alert_obj = route_and_create_alert(db, risk_eval, flow_obj, employee)
        
        db.commit()
        db.refresh(flow_obj)
        db.refresh(risk_obj)
        
        self.flows_generated_count += 1
        
        return {
            "flow": {
                "id": flow_obj.id,
                "src_ip": flow_obj.src_ip,
                "dst_ip": flow_obj.dst_ip,
                "protocol": flow_obj.protocol,
                "bytes_sent": flow_obj.bytes_sent,
                "bytes_received": flow_obj.bytes_received,
                "timestamp": flow_obj.timestamp.isoformat()
            },
            "risk_evaluation": risk_eval,
            "alert_created": bool(alert_obj),
            "alert_id": alert_obj.id if alert_obj else None
        }

    def generate_flow_for_scenario(self, db: Session, scenario_type: str, employee_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Generates simulated traffic for specific demo scenarios:
        - 'normal'
        - 'suspicious'
        - 'data_exfiltration'
        - 'brute_force'
        - 'port_scan'
        - 'dos'
        - 'botnet'
        """
        if employee_id:
            employee = db.query(Employee).filter(Employee.id == employee_id).first()
        else:
            # Pick a suitable employee depending on scenario
            if scenario_type == "data_exfiltration":
                # Amit Sharma in Finance
                employee = db.query(Employee).filter(Employee.name.like("%Amit%")).first()
            elif scenario_type == "brute_force":
                # IT / Operations employee
                employee = db.query(Employee).filter(Employee.department.has(Department.code == "IT")).first()
            else:
                employee = db.query(Employee).order_by(Employee.id).first()
                
        if not employee:
            employee = db.query(Employee).first()
            if not employee:
                raise ValueError("No employees available to simulate traffic.")
                
        now = datetime.now(timezone.utc)
        src_ip = f"10.0.{employee.department_id}.{random.randint(10, 250)}"
        device_id = employee.device_id or f"DEV-{employee.employee_code}"
        
        if scenario_type == "data_exfiltration":
            # 1.42 GB transfer at 02:30 AM to unknown external drop IP
            bytes_sent = 1420000000.0  # 1.42 GB
            bytes_recv = 24000.0       # 24 KB
            dst_ip = "198.51.100.77"   # External unobserved IP
            flow_data = {
                "timestamp": now.replace(hour=2, minute=30),
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": random.randint(49152, 65530),
                "dst_port": 443,
                "protocol": "TCP",
                "packet_count": int(bytes_sent / 1400),
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "connection_duration": 420.0,
                "connections_per_minute": 24.0,
                "upload_download_ratio": round(bytes_sent / max(1.0, bytes_recv), 2),
                "destination_reputation": 0.18,
                "is_external": True,
                "hour_of_day": 2,
                "unusual_destination": True,
                "new_device": False,
                "baseline_deviation": 0.95,
                "device_id": device_id
            }
            
        elif scenario_type == "brute_force":
            # 280 failed SSH auth attempts in 60 seconds
            bytes_sent = 1450.0
            bytes_recv = 820.0
            dst_ip = "10.0.0.12"  # Core server
            flow_data = {
                "timestamp": now,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": random.randint(49152, 65530),
                "dst_port": 22,
                "protocol": "TCP",
                "packet_count": 18,
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "connection_duration": 0.12,
                "connections_per_minute": 280.0,
                "upload_download_ratio": 1.76,
                "destination_reputation": 0.40,
                "is_external": False,
                "hour_of_day": now.hour,
                "unusual_destination": False,
                "new_device": False,
                "baseline_deviation": 0.85,
                "device_id": device_id
            }
            
        elif scenario_type == "port_scan":
            bytes_sent = 94.0
            bytes_recv = 0.0
            dst_ip = "10.0.1.1"
            flow_data = {
                "timestamp": now,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": random.randint(49152, 65530),
                "dst_port": random.randint(1, 1024),
                "protocol": "TCP",
                "packet_count": 1,
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "connection_duration": 0.02,
                "connections_per_minute": 650.0,
                "upload_download_ratio": 10.0,
                "destination_reputation": 0.50,
                "is_external": False,
                "hour_of_day": now.hour,
                "unusual_destination": True,
                "new_device": False,
                "baseline_deviation": 0.88,
                "device_id": device_id
            }
            
        elif scenario_type == "suspicious":
            # Unusual external destination, moderate volume
            bytes_sent = 4500000.0  # 4.5 MB
            bytes_recv = 120000.0
            dst_ip = "203.0.113.88"
            flow_data = {
                "timestamp": now,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": random.randint(49152, 65530),
                "dst_port": 8443,
                "protocol": "TCP",
                "packet_count": 220,
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "connection_duration": 45.0,
                "connections_per_minute": 18.0,
                "upload_download_ratio": round(bytes_sent / max(1.0, bytes_recv), 2),
                "destination_reputation": 0.55,
                "is_external": True,
                "hour_of_day": now.hour,
                "unusual_destination": True,
                "new_device": False,
                "baseline_deviation": 0.50,
                "device_id": device_id
            }
            
        else:
            # Normal business traffic
            bytes_sent = float(random.randint(2000, 45000))
            bytes_recv = float(random.randint(15000, 350000))
            dst_ip = random.choice(["10.0.0.1", "172.16.0.10", "142.250.190.46"]) # Known internal or google
            flow_data = {
                "timestamp": now.replace(hour=random.choice([10, 11, 14, 15, 16])),
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": random.randint(49152, 65530),
                "dst_port": random.choice([443, 80, 53]),
                "protocol": "TCP" if dst_ip != "53" else "UDP",
                "packet_count": random.randint(4, 30),
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "connection_duration": round(random.uniform(0.5, 4.0), 2),
                "connections_per_minute": round(random.uniform(6.0, 18.0), 1),
                "upload_download_ratio": round(bytes_sent / max(1.0, bytes_recv), 3),
                "destination_reputation": 0.98,
                "is_external": (dst_ip.startswith("142.")),
                "hour_of_day": 14,
                "unusual_destination": False,
                "new_device": False,
                "baseline_deviation": 0.05,
                "device_id": device_id
            }
            
        return self.process_and_ingest_flow(db, flow_data, employee)

simulator = NetworkTrafficSimulator.get_instance()
