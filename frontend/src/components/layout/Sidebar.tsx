import { type ReactElement } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutUser } from '../../store/authSlice'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  path: string
  icon: string
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
      { label: 'Dashboard',   path: '/dashboard',   icon: '◈' },
      { label: 'Departments', path: '/departments',  icon: '◉' },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { label: 'Activities',  path: '/activities',  icon: '◎' },
      { label: 'Outcomes',    path: '/outcomes',    icon: '◆' },
      { label: 'Signals',     path: '/signals',     icon: '▲' },
      { label: 'Analytics',   path: '/analytics',   icon: '◷' },
      { path: '/activity-logs', label: 'Activity Logs', icon:'◷'},
      { path: '/import', label: 'Data Import', icon: '📥' },
      { path: '/reports', label: 'Reports', icon: '📊' },
      { path: '/webhooks', label: 'Webhooks', icon: '🔗' }
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Automations', path: '/automations', icon: '⚙', locked: true },
      { label: 'Decisions',   path: '/decisions',   icon: '◐', locked: true },
      { label: 'Simulations', path: '/simulations', icon: '◑', locked: true },
      
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Roles',     path: '/roles',     icon: '◧' },
      { label: 'Settings',  path: '/settings',  icon: '◫' },
      { path: '/admin/users', label: 'User Management', icon: '👥', adminOnly: true },
      { path: '/admin/audit-log', label: 'Audit Log', icon: '📋', adminOnly: true },
      { path: '/api-keys', label: 'API Keys', icon: '🔑' },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }: Props): ReactElement {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user     = useAppSelector((s) => s.auth.user)
  

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AX'

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  if (!isOpen) return <></>

  return (
    <>
      {/* Overlay on mobile */}
      <div
        onClick={onClose}
        style={{
          display: 'none',
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(26,38,53,0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />

      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 260,
        background: '#e6ecf3',
        boxShadow: '8px 0 24px rgba(195,205,216,0.6)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{
          padding: '24px 22px 20px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5aa9c4, #7ec8e3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'white',
            boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
            flexShrink: 0,
          }}>
            ◈
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1a2635', letterSpacing: '0.3px' }}>
              AXIS
            </div>
            <div style={{ fontSize: 9, color: '#8096aa', letterSpacing: '0.8px', fontWeight: 600 }}>
              CENTRAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 14px' }}>
          {NAV.map((group) => (
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
                item.locked ? (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      color:      isActive ? '#5aa9c4' : '#4a5e72',
                      fontSize:   13,
                      fontWeight: isActive ? 700 : 600,
                      textDecoration: 'none',
                      marginBottom: 2,
                      background:  isActive ? 'rgba(90,169,196,0.10)' : 'transparent',
                      boxShadow:   isActive
                        ? 'inset 3px 3px 8px #c3cdd8, inset -3px -3px 8px #ffffff'
                        : 'none',
                      borderLeft:  isActive ? '3px solid #5aa9c4' : '3px solid transparent',
                      paddingLeft: isActive ? '9px' : '12px',
                      transition:  'all 0.2s ease',
                    })}
                    >
                      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
                        background: '#eaf4fb', color: '#5aa9c4',
                        padding: '2px 6px', borderRadius: 30,
                        flexShrink: 0,
                      }}>
                        PRO
                      </span>
                    </NavLink>
                  ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        color:      isActive ? '#5aa9c4' : '#4a5e72',
                        fontSize:   13,
                        fontWeight: isActive ? 700 : 600,
                        textDecoration: 'none',
                        marginBottom: 2,
                        background:  isActive ? 'rgba(90,169,196,0.10)' : 'transparent',
                        boxShadow:   isActive
                          ? 'inset 3px 3px 8px #c3cdd8, inset -3px -3px 8px #ffffff'
                          : 'none',
                        borderLeft:  isActive ? '3px solid #5aa9c4' : '3px solid transparent',
                        paddingLeft: isActive ? '9px' : '12px',
                        transition:  'all 0.2s ease',
                      })}
                  >
                    <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        {/* User card */}
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
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7ec8e3, #5aa9c4)',
            color: 'white', fontWeight: 800, fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '3px 3px 8px #c3cdd8, -3px -3px 8px #ffffff',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a2635', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name ?? 'User'}
            </div>
            <div style={{ fontSize: 10, color: '#8096aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8096aa', fontSize: 14, padding: 4,
              borderRadius: 8,
              transition: 'color 0.15s',
            }}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </aside>
    </>
  )
}