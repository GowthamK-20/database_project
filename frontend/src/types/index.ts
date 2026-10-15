export type UserRole = 'ADMIN' | 'RISK_MANAGER' | 'FRAUD_ANALYST' | 'COMPLIANCE_ANALYST' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  badge_number: string;
}

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransactionStatus = 'SUCCESS' | 'PENDING_REVIEW' | 'BLOCKED' | 'FAILED' | 'REVERSED';
export type PaymentChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CARD_POS' | 'CARD_ECOM';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED_FRAUD' | 'RESOLVED_FALSE_POSITIVE' | 'DISMISSED';
export type CasePriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
export type CaseStatus = 'OPEN' | 'IN_REVIEW' | 'ACTION_TAKEN' | 'CLOSED_CONFIRMED_FRAUD' | 'CLOSED_FALSE_POSITIVE';

export interface TransactionSummary {
  transaction_id: string;
  txn_reference: string;
  amount: string;
  currency: string;
  channel: PaymentChannel;
  recipient_identifier: string;
  transaction_status: TransactionStatus;
  transaction_timestamp: string;
  account_id: string;
  account_number_masked: string;
  customer_id: string;
  customer_name: string;
  customer_risk_tier: string;
  merchant_name?: string;
  location_city?: string;
  device_type?: string;
  risk_score: number;
  risk_level: RiskLevel;
  is_flagged: boolean;
}

export interface RiskFactor {
  id: string;
  factor_name: string;
  score_contribution: number;
  severity: RiskLevel;
  details: Record<string, any>;
  rule_name?: string;
  rule_code?: string;
}

export interface TransactionDetailResponse {
  transaction: TransactionSummary & {
    account_type: string;
    account_status: string;
    current_balance: string;
    customer_code: string;
    customer_email: string;
    customer_phone: string;
    customer_pan: string;
    kyc_status: string;
    device_fingerprint?: string;
    is_rooted_or_jailbroken?: boolean;
    device_trust_score?: number;
    location_state?: string;
    ip_address?: string;
    is_vpn_or_tor?: boolean;
    model_version?: string;
    execution_time_ms?: number;
  };
  riskFactors: RiskFactor[];
  transactionStory: string;
  relatedTransactions: Array<{
    transaction_id: string;
    txn_reference: string;
    amount: string;
    channel: string;
    recipient_identifier: string;
    status: string;
    timestamp: string;
  }>;
  associatedAlert?: {
    alert_id: string;
    alert_code: string;
    severity: RiskLevel;
    status: AlertStatus;
    sla_due_at: string;
    case_id?: string;
    case_number?: string;
    case_title?: string;
  } | null;
}

export interface AlertItem {
  alert_id: string;
  alert_code: string;
  severity: RiskLevel;
  alert_status: AlertStatus;
  sla_due_at: string;
  sla_remaining_minutes: number;
  alert_created_at: string;
  analyst_id?: string;
  analyst_name?: string;
  analyst_badge?: string;
  transaction_id: string;
  txn_reference: string;
  amount: string;
  currency: string;
  channel: PaymentChannel;
  recipient_identifier: string;
  transaction_timestamp: string;
  customer_id: string;
  customer_name: string;
  phone_masked: string;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface CaseItem {
  id: string;
  case_number: string;
  title: string;
  priority: CasePriority;
  status: CaseStatus;
  estimated_exposure: string;
  opened_at: string;
  closed_at?: string;
  analyst_id?: string;
  analyst_name?: string;
  analyst_badge?: string;
  alert_code: string;
  alert_severity: RiskLevel;
  txn_reference: string;
  transaction_amount: string;
  customer_name: string;
}

export interface CaseDetail {
  case: CaseItem & {
    primary_alert_id: string;
    sla_due_at: string;
    transaction_id: string;
    resolution_summary?: string;
  };
  notes: Array<{
    id: string;
    content: string;
    created_at: string;
    author_name: string;
    author_badge: string;
  }>;
  evidence: Array<{
    id: string;
    evidence_type: string;
    reference_id: string;
    notes: string;
    attached_at: string;
  }>;
  transaction: any;
}

export interface RiskRule {
  id: string;
  rule_code: string;
  name: string;
  description: string;
  condition_expression: Record<string, any>;
  weight_score: number;
  severity: RiskLevel;
  is_active: boolean;
  version: string;
  author_name?: string;
  updated_at: string;
}

export interface SimulationResult {
  totalMatchedCount: number;
  totalVolume: number;
  confirmedFraudMatches: number;
  falsePositiveMatches: number;
  precisionPct: number;
  projectedAlertsPerDay: number;
  matchedSample: Array<any>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'CUSTOMER' | 'ACCOUNT' | 'DEVICE' | 'MERCHANT' | 'TRANSACTION' | 'LOCATION' | 'RECIPIENT_VPA';
  riskLevel: RiskLevel;
  details?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_badge?: string;
  action: string;
  entity_name: string;
  entity_id: string;
  old_state?: any;
  new_state?: any;
  ip_address: string;
  created_at: string;
  user_full_name?: string;
  user_role?: string;
}

export interface DatabaseTableMeta {
  name: string;
  type: 'BASE TABLE' | 'VIEW';
  rowCount: number;
  primaryKeys: string[];
  columnCount: number;
}

export interface DatabaseCatalogResponse {
  databaseDialect: string;
  mode: string;
  tables: DatabaseTableMeta[];
  views: DatabaseTableMeta[];
  totalTables: number;
  totalViews: number;
}

export interface TableColumnMeta {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  isPrimaryKey: boolean;
  foreignKey: {
    column_name: string;
    foreign_table: string;
    foreign_column: string;
  } | null;
}

export interface TableForeignKeyMeta {
  column_name: string;
  foreign_table: string;
  foreign_column: string;
}

export interface TableDetailResponse {
  tableName: string;
  columns: TableColumnMeta[];
  primaryKeys: string[];
  foreignKeys: TableForeignKeyMeta[];
  rows: Record<string, any>[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
}

export interface RawQueryResponse {
  success: boolean;
  executionMs: number;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  message?: string;
}

export interface SampleQueryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  sql: string;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  executedAt: string;
  executionMs: number;
  rowCount: number;
  status: 'SUCCESS' | 'ERROR';
  error?: string;
}

