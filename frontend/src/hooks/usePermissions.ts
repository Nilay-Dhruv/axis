import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { UserRole } from '../types/auth'

// Mirror of backend ROLE_PERMISSIONS
const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  admin: new Set([
    'dashboard', 'departments', 'activities', 'activity_logs',
    'outcomes', 'signals', 'analytics', 'roles',
    'automations', 'decisions', 'simulations',
    'reports', 'import', 'webhooks', 'api_keys',
    'settings', 'admin_users', 'audit_log',
    'email', '2fa', 'search', 'notifications',
    'dept_detail', 'outcome_detail', 'signal_detail',
  ]),
  manager: new Set([
    'dashboard', 'departments', 'dept_detail',
    'activities', 'activity_logs',
    'outcomes', 'outcome_detail',
    'signals', 'signal_detail',
    'analytics', 'decisions', 'simulations',
    'automations', 'reports', 'settings',
    'search', 'notifications',
  ]),
  analyst: new Set([
    'dashboard', 'analytics',
    'outcomes', 'outcome_detail',
    'signals', 'signal_detail',
    'departments', 'dept_detail',
    'reports', 'settings',
    'search', 'notifications',
  ]),
  staff: new Set([
    'dashboard', 'activities',
    'outcomes', 'outcome_detail',
    'settings', 'notifications', 'search',
  ]),
};

export function usePermissions() {
  const user = useSelector((s: RootState) => s.auth.user);
  const role = (user?.role ?? 'staff') as UserRole;

  const can = (permission: string): boolean => {
    return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
  };

  const isAdmin    = role === 'admin';
  const isManager  = role === 'manager';
  const isAnalyst  = role === 'analyst';
  const isStaff    = role === 'staff';

  const isAtLeast = (minRole: UserRole): boolean => {
    const hierarchy: UserRole[] = ['staff', 'analyst', 'manager', 'admin'];
    return hierarchy.indexOf(role) >= hierarchy.indexOf(minRole);
  };

  return { can, role, isAdmin, isManager, isAnalyst, isStaff, isAtLeast, user };
}