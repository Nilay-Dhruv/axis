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