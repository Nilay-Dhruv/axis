import { type ReactElement, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { logoutUser } from '../../store/authSlice'
import { usePermissions } from '../../hooks/usePermissions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  path: string
  icon: string
  permission?: string
  locked?: boolean
  adminOnly?: boolean
}

interface NavGroup {
  section: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    section: 'CORE',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: '◈', permission: 'dashboard' },
      { label: 'Departments', path: '/departments', icon: '◉', permission: 'departments' },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { label: 'Activities', path: '/activities', icon: '◎', permission: 'activities' },
      { label: 'Outcomes', path: '/outcomes', icon: '◆', permission: 'outcomes' },
      { label: 'Signals', path: '/signals', icon: '▲', permission: 'signals' },
      { label: 'Analytics', path: '/analytics', icon: '◷', permission: 'analytics' },
      { label: 'Activity Logs', path: '/activity-logs', icon: '◷', permission: 'activity_logs' },
      { label: 'Data Import', path: '/import', icon: '📥', permission: 'import' },
      { label: 'Reports', path: '/reports', icon: '📊', permission: 'reports' },
      { label: 'Webhooks', path: '/webhooks', icon: '🔗', permission: 'webhooks' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Automations', path: '/automations', icon: '⚙', permission: 'automations' },
      { label: 'Decisions', path: '/decisions', icon: '◐', permission: 'decisions' },
      { label: 'Simulations', path: '/simulations', icon: '◑', permission: 'simulations' },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Roles', path: '/roles', icon: '◧', permission: 'roles' },
      { label: 'Settings', path: '/settings', icon: '◫', permission: 'settings' },
      { label: 'User Management', path: '/admin/users', icon: '👥', permission: 'admin_users', adminOnly: true },
      { label: 'Audit Log', path: '/admin/audit-log', icon: '📋', permission: 'audit_log', adminOnly: true },
      { label: 'API Keys', path: '/api-keys', icon: '🔑', permission: 'api_keys' },
    ],
  },
]

export default function Sidebar({ isOpen }: Props): ReactElement {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { can, role, user } = usePermissions()

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AX'

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  // Filter nav items by permission
  const visibleNav = useMemo(() => {
    return NAV.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.adminOnly && role !== 'admin') return false
        if (item.permission && !can(item.permission)) return false
        return true
      })
    })).filter(group => group.items.length > 0)
  }, [role])

  if (!isOpen) return <></>

  return (
    <>
      <div
        // onClick={onClose}
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(26,38,53,0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: '#e6ecf3',
          boxShadow: '8px 0 24px rgba(195,205,216,0.6)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >

        {/* Logo */}
        <div style={{
          padding: '24px 22px 20px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #5aa9c4, #7ec8e3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: 'white',
            boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
          }}>
            ◈
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1a2635' }}>
              AXIS
            </div>
            <div style={{ fontSize: 9, color: '#8096aa', fontWeight: 600 }}>
              CENTRAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 14px' }}>
          {visibleNav.map((group) => (
            <div key={group.section} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '1.2px',
                color: '#8096aa',
                padding: '0 8px',
                marginBottom: 6,
              }}>
                {group.section}
              </div>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  // onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    color: isActive ? '#5aa9c4' : '#4a5e72',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 600,
                    textDecoration: 'none',
                    marginBottom: 2,
                    background: isActive ? 'rgba(90,169,196,0.10)' : 'transparent',
                    boxShadow: isActive
                      ? 'inset 3px 3px 8px #c3cdd8, inset -3px -3px 8px #ffffff'
                      : 'none',
                    borderLeft: isActive
                      ? '3px solid #5aa9c4'
                      : '3px solid transparent',
                    paddingLeft: isActive ? '9px' : '12px',
                    transition: 'all 0.2s ease',
                  })}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div style={{
          margin: '0 14px 16px',
          background: '#e6ecf3',
          borderRadius: 16,
          boxShadow: 'inset 4px 4px 10px #c3cdd8, inset -4px -4px 10px #ffffff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7ec8e3, #5aa9c4)',
            color: 'white',
            fontWeight: 800,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {user?.full_name ?? 'User'}
            </div>
            <div style={{ fontSize: 10, color: '#8096aa' }}>
              {user?.email}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8096aa',
              fontSize: 14,
              padding: 4,
              borderRadius: 8,
            }}
          >
            ⏻
          </button>
        </div>

      </aside>
    </>
  )
}