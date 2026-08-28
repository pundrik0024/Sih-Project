export type UserRole = 'SUPER_ADMIN' | 'SECURITY_ANALYST' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'REVOKED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string | null;
  employee_id?: number | null;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  full_name: string;
  email: string;
  department_id?: number | null;
  department_name?: string | null;
  employee_id?: number | null;
}

export interface RiskFactorBreakdown {
  ml_anomaly_score: number;
  data_exfil_score: number;
  dst_anomaly_score: number;
  behavior_deviation_score: number;
  time_anomaly_score: number;
  device_anomaly_score: number;
  historical_risk_score: number;
}

export interface NetworkFlow {
  id: number;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  packet_count: number;
  bytes_sent: number;
  bytes_received: number;
  connection_duration: number;
  connections_per_min: number;
  upload_download_ratio: number;
  destination_reputation: number;
  is_external: boolean;
  device_id?: string;
  employee_id?: number;
  employee_name?: string;
  department_name?: string;
  threat_type: string;
  is_anomaly: boolean;
}

export interface Alert {
  id: number;
  title: string;
  severity: Severity;
  threat_type: string;
  risk_score: number;
  employee_id: number;
  employee_name: string;
  employee_code?: string;
  department_id: number;
  department_name: string;
  flow_id?: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  routed_to: string;
  created_at: string;
  acknowledged_at?: string | null;
  incident_id?: number | null;
  incident_code?: string | null;
  flow?: Partial<NetworkFlow>;
  risk_breakdown?: RiskFactorBreakdown;
  reasons?: string[];
  recommended_action?: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  severity: Severity;
  threat_type: string;
  risk_score: number;
  employee_id: number;
  employee_code?: string;
  employee_name: string;
  employee_status?: AccountStatus;
  department_id: number;
  department_name: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'CLOSED';
  assigned_manager_name?: string;
  description?: string;
  reasons: string[];
  recommended_action?: string;
  investigation_notes?: string;
  risk_breakdown?: RiskFactorBreakdown;
  created_at: string;
  resolved_at?: string | null;
  employee?: Partial<Employee>;
  department?: Partial<Department>;
  flow?: Partial<NetworkFlow>;
  response_actions?: ResponseAction[];
}

export interface EmployeeBaseline {
  avg_daily_bytes_sent: number;
  avg_daily_bytes_received: number;
  avg_connections_per_min: number;
  typical_protocols: string[];
  common_destinations: string[];
  normal_work_hours: string;
  typical_device_code?: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  name: string;
  department_id: number;
  department_name: string;
  role_title: string;
  email: string;
  account_status: AccountStatus;
  device_id?: string;
  work_start_hour: number;
  work_end_hour: number;
  working_hours?: string;
  risk_score: number;
  current_status: string;
  last_activity?: string;
  previous_incidents_count: number;
  created_at: string;
  baseline?: EmployeeBaseline;
  risk_history_7d?: { timestamp: string; day: string; risk_score: number }[];
  recent_alerts?: Alert[];
  recent_flows?: NetworkFlow[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
  manager_email?: string;
  employee_count: number;
  average_risk_score: number;
  active_threats_count: number;
}

export interface ResponseAction {
  id: number;
  action_type: 'RESTRICT' | 'REVOKE' | 'RESTORE' | 'INVESTIGATE' | 'ESCALATE';
  previous_status: string;
  new_status: string;
  reason: string;
  executed_by_name: string;
  executed_by_role: string;
  executed_at: string;
}

export interface AuditLog {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  target_employee_code?: string;
  target_employee_name?: string;
  department_name?: string;
  incident_code?: string;
  reason: string;
  previous_status?: string;
  new_status?: string;
  ip_address: string;
  timestamp: string;
}

export interface MLStatus {
  is_loaded: boolean;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    total_samples: number;
    train_samples: number;
    test_samples: number;
    labels: string[];
    confusion_matrix: number[][];
    feature_importances: Record<string, number>;
    dataset_notice: string;
    trained_at: string;
  };
  models: {
    anomaly_detector: string;
    threat_classifier: string;
    scaler: string;
  };
  disclaimer: string;
}
