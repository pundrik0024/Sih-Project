import os
import sys
import json
import random
from datetime import datetime, timezone, timedelta

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database.session import SessionLocal, Base, engine
from app.database.models import (
    Department, User, Employee, Device, EmployeeBaseline,
    NetworkFlow, RiskScore, Alert, Incident, ResponseAction, AuditLog,
    RoleEnum, SeverityEnum, AccountStatusEnum, ThreatTypeEnum
)
from app.core.security import get_password_hash

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding Departments...")
        depts_data = [
            {"name": "Finance", "code": "FIN", "description": "Financial Planning, Accounts, and Regulatory Audits", "manager_name": "Rajesh Gupta", "manager_email": "finance.manager@demo.local"},
            {"name": "Human Resources", "code": "HR", "description": "Personnel Management, Recruitment, and Internal Relations", "manager_name": "Sunita Rao", "manager_email": "hr.manager@demo.local"},
            {"name": "IT & Infrastructure", "code": "IT", "description": "Enterprise Networks, Cloud Infrastructure, and IT Support", "manager_name": "Vikram Singh", "manager_email": "it.manager@demo.local"},
            {"name": "Operations", "code": "OPS", "description": "Supply Chain, Field Operations, and Logistics", "manager_name": "Anand Verma", "manager_email": "ops.manager@demo.local"},
            {"name": "Research & Development", "code": "RND", "description": "Advanced Applied Technologies & Cryptographic Systems", "manager_name": "Dr. Neha Sharma", "manager_email": "rnd.manager@demo.local"},
            {"name": "Administration", "code": "ADM", "description": "Executive Services and Facilities Management", "manager_name": "Sanjay Saxena", "manager_email": "admin.dept@demo.local"}
        ]
        
        dept_map = {}
        for d in depts_data:
            dept_obj = Department(**d)
            db.add(dept_obj)
            db.flush()
            dept_map[d["code"]] = dept_obj
            
        print("Seeding Employees, Baselines, and Devices...")
        employees_data = [
            # Finance
            {"code": "FIN-101", "name": "Amit Sharma", "dept": "FIN", "role": "Senior Financial Analyst", "email": "amit.sharma@demo.local", "device": "WS-FIN-101", "ip": "10.0.1.15", "hours": (9, 18), "risk": 15.0, "incidents": 0, "avg_sent": 28000000.0},
            {"code": "FIN-102", "name": "Sneha Mehta", "dept": "FIN", "role": "Payroll Specialist", "email": "sneha.mehta@demo.local", "device": "WS-FIN-102", "ip": "10.0.1.16", "hours": (9, 17), "risk": 12.0, "incidents": 0, "avg_sent": 18000000.0},
            {"code": "FIN-103", "name": "Rohan Joshi", "dept": "FIN", "role": "Financial Auditor", "email": "rohan.joshi@demo.local", "device": "WS-FIN-103", "ip": "10.0.1.17", "hours": (9, 18), "risk": 18.0, "incidents": 0, "avg_sent": 35000000.0},
            
            # HR
            {"code": "HR-201", "name": "Priya Patel", "dept": "HR", "role": "HR Director", "email": "priya.patel@demo.local", "device": "LT-HR-201", "ip": "10.0.2.10", "hours": (9, 18), "risk": 10.0, "incidents": 0, "avg_sent": 15000000.0},
            {"code": "HR-202", "name": "Rahul Nair", "dept": "HR", "role": "Talent Acquisition Lead", "email": "rahul.nair@demo.local", "device": "LT-HR-202", "ip": "10.0.2.11", "hours": (9, 18), "risk": 14.0, "incidents": 0, "avg_sent": 22000000.0},
            {"code": "HR-203", "name": "Kavita Desai", "dept": "HR", "role": "HR Generalist", "email": "kavita.desai@demo.local", "device": "LT-HR-203", "ip": "10.0.2.12", "hours": (9, 17), "risk": 8.0, "incidents": 0, "avg_sent": 12000000.0},
            
            # IT
            {"code": "IT-301", "name": "Vikram Singh", "dept": "IT", "role": "Lead Infrastructure Architect", "email": "vikram.singh@demo.local", "device": "SRV-IT-301", "ip": "10.0.3.5", "hours": (8, 20), "risk": 20.0, "incidents": 0, "avg_sent": 95000000.0},
            {"code": "IT-302", "name": "Arjun Rao", "dept": "IT", "role": "Network Security Engineer", "email": "arjun.rao@demo.local", "device": "WS-IT-302", "ip": "10.0.3.22", "hours": (8, 19), "risk": 22.0, "incidents": 0, "avg_sent": 85000000.0},
            {"code": "IT-303", "name": "Deepak Kumar", "dept": "IT", "role": "Database Administrator", "email": "deepak.kumar@demo.local", "device": "WS-IT-303", "ip": "10.0.3.25", "hours": (9, 18), "risk": 16.0, "incidents": 0, "avg_sent": 120000000.0},
            
            # Operations
            {"code": "OPS-401", "name": "Anand Verma", "dept": "OPS", "role": "Supply Chain Operations Lead", "email": "anand.verma@demo.local", "device": "WS-OPS-401", "ip": "10.0.4.14", "hours": (8, 18), "risk": 15.0, "incidents": 0, "avg_sent": 30000000.0},
            {"code": "OPS-402", "name": "Pooja Iyer", "dept": "OPS", "role": "Logistics Coordinator", "email": "pooja.iyer@demo.local", "device": "LT-OPS-402", "ip": "10.0.4.18", "hours": (9, 18), "risk": 11.0, "incidents": 0, "avg_sent": 20000000.0},
            
            # RND
            {"code": "RND-501", "name": "Dr. Neha Sharma", "dept": "RND", "role": "Principal AI Scientist", "email": "neha.sharma@demo.local", "device": "WS-RND-501", "ip": "10.0.5.10", "hours": (9, 20), "risk": 25.0, "incidents": 0, "avg_sent": 150000000.0},
            {"code": "RND-502", "name": "Manish Reddy", "dept": "RND", "role": "Cryptographic Research Engineer", "email": "manish.reddy@demo.local", "device": "WS-RND-502", "ip": "10.0.5.11", "hours": (9, 19), "risk": 18.0, "incidents": 0, "avg_sent": 110000000.0},
            
            # Administration
            {"code": "ADM-601", "name": "Sanjay Saxena", "dept": "ADM", "role": "Executive Facilities Manager", "email": "sanjay.saxena@demo.local", "device": "WS-ADM-601", "ip": "10.0.6.10", "hours": (9, 18), "risk": 8.0, "incidents": 0, "avg_sent": 15000000.0}
        ]
        
        emp_map = {}
        for ed in employees_data:
            dept_obj = dept_map[ed["dept"]]
            emp = Employee(
                employee_code=ed["code"],
                name=ed["name"],
                department_id=dept_obj.id,
                role_title=ed["role"],
                email=ed["email"],
                account_status=AccountStatusEnum.ACTIVE,
                device_id=ed["device"],
                work_start_hour=ed["hours"][0],
                work_end_hour=ed["hours"][1],
                risk_score=ed["risk"],
                current_status="Normal",
                last_activity=datetime.now(timezone.utc),
                previous_incidents_count=ed["incidents"]
            )
            db.add(emp)
            db.flush()
            emp_map[ed["code"]] = emp
            
            # Create Device
            dev = Device(
                device_code=ed["device"],
                device_name=f"{ed['name']}'s Primary Device",
                device_type="Workstation" if ed["device"].startswith("WS") else ("Laptop" if ed["device"].startswith("LT") else "Server"),
                ip_address=ed["ip"],
                mac_address=f"00:50:56:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}",
                employee_id=emp.id,
                is_authorized=True
            )
            db.add(dev)
            
            # Create Baseline
            baseline = EmployeeBaseline(
                employee_id=emp.id,
                avg_daily_bytes_sent=ed["avg_sent"],
                avg_daily_bytes_received=ed["avg_sent"] * 3.5,
                avg_connections_per_min=float(random.randint(8, 16)),
                typical_protocols=json.dumps(["HTTPS", "DNS", "HTTP"]),
                common_destinations=json.dumps(["10.0.0.1", "10.0.1.5", "172.16.0.10", "142.250.190.46"]),
                normal_work_hours=f"{ed['hours'][0]:02d}:00 - {ed['hours'][1]:02d}:00",
                typical_device_code=ed["device"],
                max_normal_burst_bytes=ed["avg_sent"] * 2.0
            )
            db.add(baseline)
            
        print("Seeding Users & Demo Accounts...")
        # Common password hash for demo accounts
        # adminPassword123!, managerPassword123!, analystPassword123!, employeePassword123!
        users_data = [
            {
                "email": "admin@demo.local",
                "password": get_password_hash("adminPassword123!"),
                "full_name": "Security Super Admin",
                "role": RoleEnum.SUPER_ADMIN,
                "department_id": None,
                "employee_id": None
            },
            {
                "email": "finance.manager@demo.local",
                "password": get_password_hash("managerPassword123!"),
                "full_name": "Rajesh Gupta (Finance Manager)",
                "role": RoleEnum.DEPARTMENT_MANAGER,
                "department_id": dept_map["FIN"].id,
                "employee_id": None
            },
            {
                "email": "hr.manager@demo.local",
                "password": get_password_hash("managerPassword123!"),
                "full_name": "Sunita Rao (HR Manager)",
                "role": RoleEnum.DEPARTMENT_MANAGER,
                "department_id": dept_map["HR"].id,
                "employee_id": None
            },
            {
                "email": "it.manager@demo.local",
                "password": get_password_hash("managerPassword123!"),
                "full_name": "Vikram Singh (IT Manager)",
                "role": RoleEnum.DEPARTMENT_MANAGER,
                "department_id": dept_map["IT"].id,
                "employee_id": emp_map["IT-301"].id
            },
            {
                "email": "analyst@demo.local",
                "password": get_password_hash("analystPassword123!"),
                "full_name": "SOC Lead Analyst",
                "role": RoleEnum.SECURITY_ANALYST,
                "department_id": None,
                "employee_id": None
            },
            {
                "email": "employee@demo.local",
                "password": get_password_hash("employeePassword123!"),
                "full_name": "Amit Sharma (Employee View)",
                "role": RoleEnum.EMPLOYEE,
                "department_id": dept_map["FIN"].id,
                "employee_id": emp_map["FIN-101"].id
            }
        ]
        
        for ud in users_data:
            user_obj = User(
                email=ud["email"],
                hashed_password=ud["password"],
                full_name=ud["full_name"],
                role=ud["role"],
                department_id=ud["department_id"],
                employee_id=ud["employee_id"],
                is_active=True
            )
            db.add(user_obj)
            
        print("Generating Initial Historical Flows & Baseline Records...")
        now = datetime.now(timezone.utc)
        for emp_code, emp in emp_map.items():
            # Add 10-15 background normal flows per employee
            for i in range(random.randint(8, 14)):
                ts = now - timedelta(hours=random.randint(1, 48), minutes=random.randint(0, 59))
                b_sent = float(random.randint(1000, 35000))
                b_recv = float(random.randint(15000, 250000))
                flow = NetworkFlow(
                    timestamp=ts,
                    src_ip=f"10.0.{emp.department_id}.{random.randint(10, 250)}",
                    dst_ip=random.choice(["10.0.0.1", "172.16.0.10", "142.250.190.46", "13.107.4.52"]),
                    src_port=random.randint(49152, 65535),
                    dst_port=random.choice([443, 80, 53]),
                    protocol="TCP",
                    packet_count=random.randint(2, 20),
                    bytes_sent=b_sent,
                    bytes_received=b_recv,
                    connection_duration=round(random.uniform(0.2, 3.5), 2),
                    connections_per_min=round(random.uniform(5.0, 15.0), 1),
                    upload_download_ratio=round(b_sent / max(1.0, b_recv), 3),
                    destination_reputation=0.98,
                    is_external=True,
                    device_id=emp.device_id,
                    employee_id=emp.id,
                    threat_type="Normal Traffic",
                    is_anomaly=False
                )
                db.add(flow)
                db.flush()
                
                risk = RiskScore(
                    flow_id=flow.id,
                    employee_id=emp.id,
                    total_score=float(random.randint(8, 22)),
                    severity=SeverityEnum.LOW,
                    ml_anomaly_score=10.0,
                    data_exfil_score=5.0,
                    dst_anomaly_score=5.0,
                    behavior_deviation_score=10.0,
                    time_anomaly_score=5.0,
                    device_anomaly_score=5.0,
                    historical_risk_score=10.0,
                    reasons_json=json.dumps(["Normal baseline operation."]),
                    explanation_summary="Traffic volume within expected limits.",
                    recommended_action="No action required.",
                    timestamp=ts
                )
                db.add(risk)
                
        print("Seeding Audit Log history...")
        audit_records = [
            AuditLog(
                actor_name="Security Super Admin",
                actor_role="SUPER_ADMIN",
                action="SYSTEM_INITIALIZE",
                target_employee_code="SYSTEM",
                target_employee_name="AegisGuard SOC Enclave",
                department_name="SYSTEM",
                incident_code="INIT-0001",
                reason="Initial baseline profile ingestion and optical diode configuration.",
                previous_status="OFFLINE",
                new_status="ACTIVE",
                timestamp=now - timedelta(days=2)
            ),
            AuditLog(
                actor_name="Vikram Singh",
                actor_role="DEPARTMENT_MANAGER",
                action="IAM_RESTORE_ACCESS",
                target_employee_code="IT-303",
                target_employee_name="Deepak Kumar",
                department_name="IT & Infrastructure",
                incident_code="INC-20260825-IT01",
                reason="Routine database migration maintenance verified by manager.",
                previous_status="RESTRICTED",
                new_status="ACTIVE",
                timestamp=now - timedelta(days=1, hours=5)
            )
        ]
        for ar in audit_records:
            db.add(ar)
            
        db.commit()
        print("Database successfully seeded with realistic SOC demo data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
