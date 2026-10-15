import {
  DatabaseCatalogResponse,
  TableDetailResponse,
  RawQueryResponse,
  SampleQueryItem,
  QueryHistoryItem
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;


  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('veyra_auth_token', token);
    } else {
      localStorage.removeItem('veyra_auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('veyra_auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      // Optional callback or event
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errBody.message || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async login(credentials: { username: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Overview
  async getOverviewMetrics() {
    return this.request<any>('/overview/metrics');
  }

  async getAttentionQueue() {
    return this.request<{ items: any[] }>('/overview/attention-queue');
  }

  async getRiskDistribution() {
    return this.request<{ distribution: any[] }>('/overview/risk-distribution');
  }

  // Transactions
  async listTransactions(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    return this.request<{ data: any[]; meta: any }>(`/transactions?${qs.toString()}`);
  }

  async getTransactionById(id: string) {
    return this.request<any>(`/transactions/${id}`);
  }

  // Alerts
  async listAlerts(status?: string, severity?: string) {
    const qs = new URLSearchParams();
    if (status) qs.append('status', status);
    if (severity) qs.append('severity', severity);
    return this.request<{ alerts: any[] }>(`/alerts?${qs.toString()}`);
  }

  async updateAlertStatus(id: string, status: string, assignedTo?: string) {
    return this.request<any>(`/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, assignedTo }),
    });
  }

  // Cases
  async listCases(status?: string, priority?: string) {
    const qs = new URLSearchParams();
    if (status) qs.append('status', status);
    if (priority) qs.append('priority', priority);
    return this.request<{ cases: any[] }>(`/cases?${qs.toString()}`);
  }

  async getCaseById(id: string) {
    return this.request<any>(`/cases/${id}`);
  }

  async addCaseNote(caseId: string, content: string) {
    return this.request<any>(`/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async executeCaseAction(caseId: string, payload: { actionType: string; reason: string; targetAccountId?: string; targetDeviceId?: string }) {
    return this.request<any>(`/cases/${caseId}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Rules & Simulator
  async listRules() {
    return this.request<{ rules: any[] }>('/rules');
  }

  async updateRule(id: string, updates: any) {
    return this.request<any>(`/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async simulateRule(parameters: any) {
    return this.request<{ simulation: any }>('/rules/simulate', {
      method: 'POST',
      body: JSON.stringify(parameters),
    });
  }

  // Graph Intelligence
  async getEntityGraph(id: string) {
    return this.request<{ nodes: any[]; links: any[]; clusterSummary: any }>(`/graph/entity/${id}`);
  }

  async getMuleClusters() {
    return this.request<{ clusters: any[] }>('/graph/mule-clusters');
  }

  // Entities
  async listCustomers() {
    return this.request<{ customers: any[] }>('/entities/customers');
  }

  async getCustomer360(id: string) {
    return this.request<any>(`/entities/customers/${id}`);
  }

  async listMerchants() {
    return this.request<{ merchants: any[] }>('/entities/merchants');
  }

  // Analytics & Compliance
  async getAnalyticsMetrics() {
    return this.request<any>('/analytics/metrics');
  }

  async getComplianceSTRReport() {
    return this.request<{ reportHeader: any; records: any[] }>('/analytics/reports/str');
  }

  // Audit Log
  async listAuditLogs(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params);
    return this.request<{ logs: any[] }>(`/audit?${qs.toString()}`);
  }

  // Database Catalog & SQL Explorer
  async getDatabaseTables(): Promise<DatabaseCatalogResponse> {
    return this.request<DatabaseCatalogResponse>('/database/tables');
  }

  async getTableDetails(
    tableName: string,
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<TableDetailResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.pageSize) qs.append('pageSize', String(params.pageSize));
    if (params.search) qs.append('search', params.search);
    if (params.sortBy) qs.append('sortBy', params.sortBy);
    if (params.sortOrder) qs.append('sortOrder', params.sortOrder);

    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<TableDetailResponse>(`/database/tables/${tableName}${query}`);
  }

  async executeRawQuery(sql: string): Promise<RawQueryResponse> {
    return this.request<RawQueryResponse>('/database/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  }

  async getSampleQueries(): Promise<{ queries: SampleQueryItem[] }> {
    return this.request<{ queries: SampleQueryItem[] }>('/database/sample-queries');
  }

  async getQueryHistory(): Promise<{ history: QueryHistoryItem[] }> {
    return this.request<{ history: QueryHistoryItem[] }>('/database/history');
  }
}

export const api = new ApiService();
