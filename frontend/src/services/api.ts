import { AuthResponse, User, NetworkFlow, Alert, Incident, Employee, Department, AuditLog, MLStatus } from '../types';

const API_BASE = `⁠$
  {import.meta.env.VITE_API_URL}/api/v1`;

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('aegis_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  // Dashboard
  async getDashboardSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Network Flows
  async getNetworkFlows(limit: number = 50, threatOnly: boolean = false, protocol?: string): Promise<NetworkFlow[]> {
    let url = `${API_BASE}/network/flows?limit=${limit}`;
    if (threatOnly) url += `&threat_only=true`;
    if (protocol) url += `&protocol=${encodeURIComponent(protocol)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<NetworkFlow[]>(res);
  },

  async triggerSimulatorTick(): Promise<any> {
    const res = await fetch(`${API_BASE}/network/simulate/tick`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async triggerScenario(scenario: string, employeeId?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/network/trigger-scenario`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scenario, employee_id: employeeId }),
    });
    return handleResponse<any>(res);
  },

  // 1-Click Demo
  async runDemoScenario(scenarioName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/run-scenario/${scenarioName}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Alerts
  async getAlerts(severity?: string, statusFilter?: string): Promise<Alert[]> {
    let url = `${API_BASE}/alerts?limit=100`;
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    if (statusFilter) url += `&status_filter=${encodeURIComponent(statusFilter)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Alert[]>(res);
  },

  async getAlertDetail(alertId: number): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
      headers: getHeaders(),
    });
    return handleResponse<Alert>(res);
  },

  async acknowledgeAlert(alertId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Incidents
  async getIncidents(statusFilter?: string, severity?: string): Promise<Incident[]> {
    let url = `${API_BASE}/incidents?limit=100`;
    if (statusFilter) url += `&status_filter=${encodeURIComponent(statusFilter)}`;
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Incident[]>(res);
  },

  async getIncidentDetail(incidentId: number): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      headers: getHeaders(),
    });
    return handleResponse<Incident>(res);
  },

  // Employees & UEBA
  async getEmployees(departmentId?: number, statusFilter?: string, search?: string): Promise<Employee[]> {
    let url = `${API_BASE}/employees?`;
    if (departmentId) url += `department_id=${departmentId}&`;
    if (statusFilter) url += `status_filter=${encodeURIComponent(statusFilter)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Employee[]>(res);
  },

  async getEmployeeDetail(employeeId: number): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
      headers: getHeaders(),
    });
    return handleResponse<Employee>(res);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: getHeaders(),
    });
    return handleResponse<Department[]>(res);
  },

  // IAM Response Layer
  async executeIAMAction(employeeId: number, actionType: string, reason: string, incidentId?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/response/execute/${employeeId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action_type: actionType,
        reason: reason,
        incident_id: incidentId,
      }),
    });
    return handleResponse<any>(res);
  },

  // Audit Logs
  async getAuditLogs(search?: string): Promise<AuditLog[]> {
    let url = `${API_BASE}/audit-logs?limit=200`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<AuditLog[]>(res);
  },

  // ML Hub
  async getMLStatus(): Promise<MLStatus> {
    const res = await fetch(`${API_BASE}/ml/status`, {
      headers: getHeaders(),
    });
    return handleResponse<MLStatus>(res);
  },

  async retrainML(): Promise<any> {
    const res = await fetch(`${API_BASE}/ml/retrain`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async predictFlow(flowPayload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(flowPayload),
    });
    return handleResponse<any>(res);
  },

  // Settings
  async getSystemSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/config`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async updateRiskWeights(weights: Record<string, number>): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/weights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(weights),
    });
    return handleResponse<any>(res);
  },

  // Architecture Info
  async getArchitectureInfo(): Promise<any> {
    const res = await fetch(`${API_BASE}/architecture/info`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },
};
