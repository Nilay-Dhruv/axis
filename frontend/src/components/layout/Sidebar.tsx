import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { SidebarProps } from '../../types/layout'

const NAV_SECTIONS = [
  {
    label: 'CORE',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '⬡' },
      { id: 'departments', label: 'Departments', path: '/departments', icon: '◈' },
      { id: 'activities', label: 'Activities', path: '/activities', icon: '◎' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'outcomes', label: 'Outcomes', path: '/outcomes', icon: '◆' },
      { id: 'signals', label: 'Signals', path: '/signals', icon: '▲' },
      { id: 'analytics', label: 'Analytics', path: '/analytics', icon: '◉' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'automations', label: 'Automations', path: '/automations', icon: '⬟', badge: 3 },
      { id: 'decisions', label: 'Decision Log', path: '/decisions', icon: '◐' },
      { id: 'simulations', label: 'Simulations', path: '/simulations', icon: '⬠', tier: 'premium' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'roles', label: 'Roles & Access', path: '/roles', icon: '◑' },
      { id: 'settings', label: 'Settings', path: '/settings', icon: '◧' },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // const location = useLocation()
  const { user } = useAuth()

  const tier = user?.subscription_tier ?? 'free'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
        className="fixed top-0 left-0 h-full z-40 flex flex-col lg:translate-x-0 lg:static lg:z-auto"
      >
        {/* Logo */}
        <div
          style={{ height: 'var(--header-height)', borderBottom: '1px solid var(--border)' }}
          className="flex items-center px-5 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--cyan-glow)',
                border: '1px solid var(--cyan)',
                boxShadow: '0 0 12px var(--cyan-glow-strong)',
              }}
              className="flex items-center justify-center"
            >
              <span
                style={{ color: 'var(--cyan)', fontSize: 14, fontFamily: 'Rajdhani', fontWeight: 700 }}
              >
                AX
              </span>
            </div>
            <div>
              <div
                style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 18, letterSpacing: '0.1em', color: 'var(--text-primary)' }}
              >
                AXIS
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>
                CENTRAL INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            className="ml-auto lg:hidden hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: 'var(--text-muted)',
                  fontFamily: 'Rajdhani',
                  fontWeight: 600,
                  padding: '0 8px',
                  marginBottom: 4,
                }}
              >
                {section.label}
              </div>

              {section.items.map((item) => {
  const isPremiumLocked = item.tier === 'premium' && tier === 'free'

                return (
                  <NavLink
                    key={item.id}
                    to={isPremiumLocked ? '#' : item.path}
                    onClick={isPremiumLocked ? (e) => e.preventDefault() : onClose}
                    style={({ isActive: navActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      marginBottom: 1,
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      textDecoration: 'none',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                      background: navActive ? 'var(--cyan-glow)' : 'transparent',
                      color: navActive
                        ? 'var(--cyan)'
                        : isPremiumLocked
                        ? 'var(--text-muted)'
                        : 'var(--text-secondary)',
                      borderLeft: navActive
                        ? '2px solid var(--cyan)'
                        : '2px solid transparent',
                      opacity: isPremiumLocked ? 0.5 : 1,
                      cursor: isPremiumLocked ? 'not-allowed' : 'pointer',
                    })}
                    className="group"
                  >
                    {({ isActive: navActive }) => (
                      <>
                        <span
                          style={{
                            fontSize: 16,
                            width: 20,
                            textAlign: 'center',
                            color: navActive ? 'var(--cyan)' : 'var(--text-muted)',
                            transition: 'color 0.15s',
                          }}
                        >
                          {item.icon}
                        </span>

                        <span style={{ flex: 1 }}>{item.label}</span>

                        {/* Badge */}
                        {item.badge && !isPremiumLocked && (
                          <span
                            style={{
                              background: 'var(--cyan)',
                              color: 'var(--bg-base)',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 10,
                              fontFamily: 'Rajdhani',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Premium lock */}
                        {isPremiumLocked && (
                          <span style={{ fontSize: 10, color: 'var(--warning)' }}>⬡ PRO</span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User card at bottom */}
        <div
          style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}
          className="shrink-0"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                background: 'var(--cyan-glow)',
                border: '1px solid var(--border-bright)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--cyan)',
                fontFamily: 'Rajdhani',
                flexShrink: 0,
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.full_name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: tier === 'premium' ? 'var(--cyan)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: 'Rajdhani',
                  fontWeight: 600,
                }}
              >
                {tier === 'free' ? 'Free Tier' : tier === 'basic_premium' ? 'Basic Pro' : '◆ Premium'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}