# UniShield SOC: AI-Based Cyber Threat Detection, Risk Scoring & Department-Level Response Platform

An end-to-end, fully functional cybersecurity prototype designed for SIH / NTRO-style cybersecurity demonstrations.

> **Project Title:**  
> *“AI-Based Detection of Cyber Threats in Unidirectional IP Traffic with Risk-Based Insider Threat Detection and Authorized Response”*

---

## 1. Core Architectural Concept

```
[ MONITORED ENTERPRISE NETWORK ]
                │
                ▼ (Mirrored Tap / Physical Tx-only Data Diode)
┌────────────────────────────────────────────────────────────────────────┐
│             READ-ONLY SECURITY MONITORING ENCLAVE                      │
│                                                                        │
│  [Packet Ingress] ──► [Feature Extraction & UEBA Baseline Profiler]   │
│                                   │                                    │
│  [Isolation Forest Anomaly] ◄─────┴─────► [Supervised Classifier]      │
│                                   │                                    │
│                 [Explainable 0–100 Risk Scoring Engine]                │
│                                   │                                    │
│              [Department-Scoped RBAC Alert Router]                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Alerts & Incidents
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           AUTHORIZED RESPONSE & IAM LAYER (OUT-OF-BAND)                │
│                                                                        │
│   Human-in-the-Loop Review  ──►  Approve Mitigation (Restrict/Revoke)  │
│                                           │                            │
│                     [Tamper-Evident Audit Logging]                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Guarantees:
1. **Zero Write Capability into Monitored Network**: Detection is performed inside an isolated read-only enclave observing mirrored IP flows. The detection engine cannot inject packets, modify traffic, or disrupt production workloads.
2. **Strict Department RBAC Isolation**: A Finance Department Manager can **only** inspect Finance employees and alerts. Attempting to view or act upon HR/IT records results in a **`403 Forbidden`** response enforced by backend authorization logic.
3. **Explainable AI (XAI)**: Alerts provide transparent, plain-English justifications (*"Why was this detected?"*) and a 7-factor weighted scoring breakdown from 0 to 100.
4. **Human-in-the-Loop Mitigation**: The AI scores and recommends; authorized humans investigate and approve response actions through a logically separated IAM response layer.

---

## 2. Technology Stack

- **Backend**: Python 3.9+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, PyJWT, Passlib (PBKDF2/SHA-256).
- **Machine Learning**: Scikit-Learn (Isolation Forest for unsupervised anomalies + Random Forest for threat classification), Pandas, NumPy, Joblib.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React, Recharts.
- **Database**: SQLite (zero-config default for instant local execution) + PostgreSQL compatible.
- **Testing**: Pytest automated test suite with full RBAC and department isolation coverage.

---

## 3. Demo Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Security Super Admin** | `admin@demo.local` | `adminPassword123!` | Full organization-wide visibility, all departments, threat analytics, retrain models, IAM response |
| **Finance Manager** | `finance.manager@demo.local` | `managerPassword123!` | **Finance Department ONLY** (Amit Sharma, Sneha Mehta, Rohan Joshi) |
| **HR Manager** | `hr.manager@demo.local` | `managerPassword123!` | **HR Department ONLY** (Priya Patel, Rahul Nair, Kavita Desai) |
| **IT Manager** | `it.manager@demo.local` | `managerPassword123!` | **IT Department ONLY** (Vikram Singh, Arjun Rao, Deepak Kumar) |
| **Security Analyst** | `analyst@demo.local` | `analystPassword123!` | SOC incident investigation, flow inspection, escalation |
| **Employee** | `employee@demo.local` | `employeePassword123!` | Personal profile and security status notifications |

> **Note:** The UI provides an **Instant 1-Click Role Switcher** on the login page and top navigation header for seamless judge demonstrations without manual typing.

---

## 4. Quickstart: Installation & Execution

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### Option A: Automated One-Shot Script (Recommended)
```bash
cd /Users/pundrikchittora/.gemini/antigravity/scratch/cyber-threat-platform
./run.sh
```
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

---

### Option B: Manual Step-by-Step Execution

#### 1. Setup Backend
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate synthetic dataset and train AI models
python -m app.ml.train

# Seed database with realistic departments, employees, baselines, and demo accounts
python scripts/seed.py

# Start FastAPI backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Automated Verification Tests

Run the automated test suite to verify authentication, RBAC, ML inference, and **strict Department Isolation**:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest -v tests/
```

### Verified Test Cases:
- `test_root_endpoint`: Verifies platform status & read-only enclave identification.
- `test_login_super_admin`: Verifies JWT issuance, role attributes, and credential validation.
- `test_login_invalid_password`: Verifies rejection of incorrect credentials.
- `test_department_manager_isolation`: **Verifies Finance Manager receives `403 Forbidden` when attempting to access HR employee records or perform response actions outside Finance.**
- `test_ml_detection_and_prediction`: Verifies Isolation Forest anomaly scoring and Random Forest classifier on raw network payloads.
- `test_full_demo_scenario_and_audit_trail`: Verifies end-to-end Data Exfiltration simulation, critical alert generation, department routing, manager IAM restriction, and immutable audit logging.

---

## 6. Machine Learning Pipeline & UEBA Engine

### Models:
1. **Model 1 — Anomaly Detection (Unsupervised)**:
   - Algorithm: `IsolationForest(contamination=0.08, n_estimators=120)`
   - Trained strictly on normal baseline traffic to detect statistical outliers without prior label bias.
2. **Model 2 — Threat Classifier (Supervised Multi-Class)**:
   - Algorithm: `RandomForestClassifier(n_estimators=150, max_depth=14, class_weight='balanced')`
   - Classifies threat types: *Data Exfiltration, Brute Force, Port Scanning, DoS, Botnet, Abnormal Outbound, Normal Traffic*.

### Explainable Risk Scoring Formula:
$$\text{Risk Score} = \sum_{i=1}^7 (\text{Factor}_i \times \text{Weight}_i)$$

| Factor | Description | Weight |
|---|---|---|
| **ML Anomaly Score** | Isolation Forest decision index + model confidence | 30% |
| **Data Exfiltration** | Outbound bytes volume burst & upload/download ratio | 20% |
| **Destination Anomaly** | Unobserved external destination IP & reputation rating | 15% |
| **Behavior Deviation** | Divergence from employee's historical baseline | 15% |
| **Time Anomaly** | Off-hours network activity (e.g. 02:30 AM) | 5% |
| **Device Anomaly** | Unregistered MAC address or device ID mismatch | 5% |
| **Historical Risk** | Prior security violations and incident penalties | 10% |

- **0–30**: `LOW` (Logged passively)
- **31–60**: `MEDIUM` (Notify Department Manager)
- **61–80**: `HIGH` (Notify Department Manager + Security Analyst)
- **81–100**: `CRITICAL` (Notify Department Manager + Security Analyst + Super Admin)

---

## 7. Guided Presentation Demo (Step-by-Step for Judges)

1. **Sign In**: Navigate to `http://localhost:5173` and click **Security Admin** on the instant login grid.
2. **SOC Dashboard Overview**:
   - Observe real-time KPI metrics (Flows, Monitored Users, AI Flagged Threats, High-Risk Users).
   - Review the *Unidirectional Ingress Volume vs. AI Anomalies* area graph and *Entity Risk Distribution* pie chart.
3. **Execute Attack Scenario**:
   - Click **Interactive Demo** in the sidebar.
   - Select **Scenario C — Critical Data Exfiltration Attack (Finance)**.
   - Click **Execute Complete Scenario**.
   - Watch the animated **7-stage pipeline visualizer**:
     1. Mirrored Ingress Tap captures 1.42 GB off-hours upload at 02:30 AM.
     2. Feature extraction scales 14 vectors.
     3. Isolation Forest detects severe statistical anomaly (Score: 95/100).
     4. UEBA baseline comparator flags 18× volume spike for **Amit Sharma** (Finance).
     5. Explainable Risk Engine calculates **91/100 (CRITICAL)**.
     6. Alert Engine automatically routes alert to **Finance Manager** + SOC.
     7. IAM mitigation layer prepares containment action.
4. **Inspect Incident & Reasoning**:
   - Review the **"Why was this detected?"** bullet points.
   - Inspect the **7-factor weighted composition progress bars**.
5. **Verify Department Isolation**:
   - Click **Switch to Department Manager Portal** (or switch to *Finance Manager* via top header).
   - Navigate to **Employees** — verify you only see Finance employees.
   - Attempting to inspect HR records is blocked with a 403 Forbidden notification.
6. **Initiate Authorized Response**:
   - In the alert or incident detail, click **Authorized Response Action**.
   - Select **Restrict Access**, enter justification: *"Off-hours 1.4GB data exfiltration to unobserved overseas IP."*
   - Click **Confirm & Execute Action**.
   - Amit Sharma's account status updates to **`RESTRICTED`**.
7. **Verify Compliance in Audit Trail**:
   - Navigate to **Audit Logs**.
   - Inspect the immutable audit entry recording actor, target entity, previous status (`ACTIVE`), new status (`RESTRICTED`), and justification timestamp.

---

## 8. Docker Deployment

To launch via Docker Compose:
```bash
docker-compose up --build
```
