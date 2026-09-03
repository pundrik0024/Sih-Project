import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.database.models import Employee, Department, AccountStatusEnum

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "UniShield" in data["platform"]
    assert data["monitoring_enclave"] == "READ_ONLY_UNIDIRECTIONAL_TAP"

def test_login_super_admin():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@demo.local", "password": "adminPassword123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "SUPER_ADMIN"
    assert data["email"] == "admin@demo.local"

def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@demo.local", "password": "wrongPassword"}
    )
    assert response.status_code == 401

def test_department_manager_isolation():
    """
    CRITICAL SECURITY TEST:
    Finance Manager can view Finance employees, but MUST get 403 FORBIDDEN when attempting
    to view HR employee details or execute response actions on HR employees.
    """
    # 1. Login as Finance Manager
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "finance.manager@demo.local", "password": "managerPassword123!"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    db = SessionLocal()
    fin_emp = db.query(Employee).filter(Employee.employee_code == "FIN-101").first()
    hr_emp = db.query(Employee).filter(Employee.employee_code == "HR-201").first()
    db.close()
    
    assert fin_emp is not None
    assert hr_emp is not None
    
    # 2. Finance Manager accesses Finance employee -> 200 OK
    fin_res = client.get(f"/api/v1/employees/{fin_emp.id}", headers=headers)
    assert fin_res.status_code == 200
    assert fin_res.json()["name"] == "Amit Sharma"
    
    # 3. Finance Manager attempts to access HR employee -> MUST FAIL WITH 403 FORBIDDEN
    hr_res = client.get(f"/api/v1/employees/{hr_emp.id}", headers=headers)
    assert hr_res.status_code == 403
    assert "Access Denied" in hr_res.json()["detail"]
    
    # 4. Finance Manager attempts to restrict access for HR employee -> MUST FAIL WITH 403 FORBIDDEN
    restrict_res = client.post(
        f"/api/v1/response/restrict/{hr_emp.id}",
        headers=headers,
        json={"action_type": "RESTRICT", "reason": "Unauthorized attempt on HR"}
    )
    assert restrict_res.status_code == 403
    assert "Access Denied" in restrict_res.json()["detail"]

def test_ml_detection_and_prediction():
    # Login as Admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@demo.local", "password": "adminPassword123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test ML status endpoint
    status_res = client.get("/api/v1/ml/status", headers=headers)
    assert status_res.status_code == 200
    ml_data = status_res.json()
    assert ml_data["is_loaded"] is True
    assert "accuracy" in ml_data["metrics"]
    
    # Test ML live predict
    test_flow = {
        "bytes_sent": 1400000000.0,
        "bytes_received": 12000.0,
        "packet_count": 950000,
        "connection_duration": 450.0,
        "connections_per_minute": 24.0,
        "upload_download_ratio": 116666.0,
        "destination_reputation": 0.15,
        "is_external": True,
        "hour_of_day": 2,
        "unusual_destination": True,
        "new_device": False,
        "baseline_deviation": 0.95
    }
    pred_res = client.post("/api/v1/ml/predict", headers=headers, json=test_flow)
    assert pred_res.status_code == 200
    pred = pred_res.json()["prediction"]
    assert pred["is_anomaly"] is True
    assert pred["predicted_threat"] in ["Data Exfiltration", "Abnormal Outbound Traffic"]

def test_full_demo_scenario_and_audit_trail():
    """
    End-to-end test of Data Exfiltration demo flow:
    1. Super Admin runs Data Exfiltration Scenario
    2. Critical Risk Score generated (>= 81)
    3. Alert generated
    4. Finance Manager investigates and restricts employee access
    5. Verify employee status becomes RESTRICTED
    6. Verify Immutable Audit Log contains record
    7. Restore access and verify status returns to ACTIVE
    """
    # 1. Admin logs in
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@demo.local", "password": "adminPassword123!"}
    )
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Trigger Data Exfiltration demo
    demo_res = client.post("/api/v1/demo/run-scenario/data_exfiltration", headers=admin_headers)
    assert demo_res.status_code == 200
    demo_data = demo_res.json()
    assert demo_data["status"] == "success"
    
    risk_eval = demo_data["result"]["risk_evaluation"]
    assert risk_eval["total_score"] >= 80.0
    assert risk_eval["severity"] == "CRITICAL"
    assert len(risk_eval["reasons"]) > 0
    assert demo_data["result"]["alert_created"] is True
    alert_id = demo_data["result"]["alert_id"]
    
    # 3. Finance Manager logs in
    fin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "finance.manager@demo.local", "password": "managerPassword123!"}
    )
    fin_token = fin_login.json()["access_token"]
    fin_headers = {"Authorization": f"Bearer {fin_token}"}
    
    # 4. Finance Manager fetches alerts and sees the critical alert
    alerts_res = client.get("/api/v1/alerts", headers=fin_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert any(a["id"] == alert_id for a in alerts)
    
    # 5. Finance Manager restricts Amit Sharma's account
    db = SessionLocal()
    amit = db.query(Employee).filter(Employee.name.like("%Amit%")).first()
    db.close()
    
    resp_action_res = client.post(
        f"/api/v1/response/restrict/{amit.id}",
        headers=fin_headers,
        json={
            "action_type": "RESTRICT",
            "reason": "Critical risk score 90+ observed during off-hours data exfiltration scenario."
        }
    )
    assert resp_action_res.status_code == 200
    resp_data = resp_action_res.json()
    assert resp_data["success"] is True
    assert resp_data["target_employee"]["new_status"] == "RESTRICTED"
    
    # 6. Verify audit logs record this action
    audit_res = client.get("/api/v1/audit-logs", headers=fin_headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert any(l["action"] == "IAM_RESTRICT_ACCESS" and "Amit" in (l["target_employee_name"] or "") for l in audit_logs)
    
    # 7. Restore Access
    restore_res = client.post(
        f"/api/v1/response/restore/{amit.id}",
        headers=fin_headers,
        json={
            "action_type": "RESTORE",
            "reason": "Investigation completed and security containment verified."
        }
    )
    assert restore_res.status_code == 200
    assert restore_res.json()["target_employee"]["new_status"] == "ACTIVE"
