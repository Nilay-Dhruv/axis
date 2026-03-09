export type DepartmentType =
  | 'leadership' | 'finance' | 'sales' | 'marketing'
  | 'operations' | 'hr' | 'product' | 'engineering'
  | 'legal' | 'custom'

export interface DepartmentConfig {
  icon?: string
  color?: string
  description?: string
}

export interface Department {
  id: string
  organization_id: string
  name: string
  type: DepartmentType
  is_default: boolean
  is_custom: boolean
  owner_id: string | null
  config: DepartmentConfig
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  department_id: string
  name: string
  type: string
  description: string | null
  required_role: string | null
  tier_required: string
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export interface Outcome {
  id: string
  department_id: string
  name: string
  description: string | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  status: 'active' | 'achieved' | 'at_risk' | 'inactive'
  owner_id: string | null
  created_at: string
  updated_at: string
}

export interface DepartmentDetail {
  department: Department
  activities: Activity[]
  outcomes: Outcome[]
}

export interface DepartmentsState {
  list: Department[]
  selected: DepartmentDetail | null
  loading: boolean
  detailLoading: boolean
  error: string | null
  searchQuery: string
  filterType: string
}

export interface ActivityLog {
  id: string
  activity_id: string
  executed_by: string
  department_id: string
  status: 'completed' | 'failed' | 'pending'
  notes: string | null
  data: Record<string, unknown>
  result: Record<string, unknown>
  executed_at: string
}

export interface ActivityDetail {
  activity: Activity
  logs: ActivityLog[]
  log_count: number
}

export interface ActivitiesState {
  list: Activity[]
  recentLogs: ActivityLog[]
  selected: ActivityDetail | null
  loading: boolean
  executing: boolean
  error: string | null
  executeError: string | null
  searchQuery: string
  filterDept: string
  filterType: string
}

export interface Signal {
  id: string
  outcome_id: string
  name: string
  value: number | null
  threshold_min: number | null
  threshold_max: number | null
  status: 'normal' | 'warning' | 'critical'
  last_updated: string
}

export interface OutcomeWithSignals {
  outcome: Outcome
  signals: Signal[]
}

export interface OutcomeSummary {
  total_outcomes: number
  achieved: number
  at_risk: number
  active: number
  total_signals: number
  critical_signals: number
  warning_signals: number
  normal_signals: number
}

export interface OutcomesState {
  list: Outcome[]
  selected: OutcomeWithSignals | null
  summary: OutcomeSummary | null
  alerts: Signal[]
  loading: boolean
  detailLoading: boolean
  error: string | null
  searchQuery: string
  filterStatus: string
  filterDept: string
}