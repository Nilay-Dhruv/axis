import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { HeaderProps } from '../../types/layout'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/departments': 'Departments',
  '/activities':  'Activities',
  '/outcomes':    'Outcomes',
  '/signals':     'Signals',
  '/analytics':   'Analytics',
  '/automations': 'Automations',
  '/decisions':   'Decision Log',
  '/simulations': 'Simulations',
  '/roles':       'Roles & Access',
  '/settings':    'Settings',
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'AXIS'

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
  }

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          border: '1px solid var(--border)',
          background: 'transparent',
          borderRadius: 6,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
        className="lg:hidden hover:border-cyan hover:text-cyan"
      >
        <span style={{ fontSize: 16 }}>{isSidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}
        >
          {pageTitle}
        </h1>
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.15em',
            marginTop: -2,
          }}
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">

        {/* System status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--success)',
            letterSpacing: '0.1em',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
          }}
          className="hidden md:flex"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)',
              animation: 'pulseGlow 2s ease infinite',
            }}
          />
          SYSTEMS NOMINAL
        </div>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
            style={{
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              background: notifOpen ? 'var(--cyan-glow)' : 'transparent',
              borderColor: notifOpen ? 'var(--cyan)' : 'var(--border)',
              borderRadius: 6,
              color: notifOpen ? 'var(--cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 15 }}>◎</span>
            {/* Unread dot */}
            <span
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--cyan)',
                boxShadow: '0 0 6px var(--cyan)',
              }}
            />
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 300,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
                borderRadius: 8,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                animation: 'fadeSlideIn 0.2s ease',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
                  NOTIFICATIONS
                </span>
                <span style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'Rajdhani', fontWeight: 600 }}>3 NEW</span>
              </div>
              {[
                { icon: '▲', text: 'Signal threshold exceeded in Finance', time: '2m ago', type: 'warning' },
                { icon: '◆', text: 'Q4 Revenue outcome updated', time: '1h ago', type: 'info' },
                { icon: '◎', text: 'Automation "Weekly Report" triggered', time: '3h ago', type: 'success' },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 16px',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-hover"
                >
                  <span style={{ color: n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--cyan)', marginTop: 1 }}>
                    {n.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px 5px 5px',
              border: '1px solid var(--border)',
              background: dropdownOpen ? 'var(--cyan-glow)' : 'transparent',
              borderColor: dropdownOpen ? 'var(--cyan)' : 'var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 26,
                height: 26,
                background: 'var(--cyan-glow)',
                border: '1px solid var(--border-bright)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--cyan)',
                fontFamily: 'Rajdhani',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name?.split(' ')[0]}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>

          {/* User dropdown menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
                borderRadius: 8,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                animation: 'fadeSlideIn 0.2s ease',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              {/* User info */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                <div style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.15em', fontFamily: 'Rajdhani', fontWeight: 600, marginTop: 4, textTransform: 'uppercase' }}>
                  {user?.subscription_tier}
                </div>
              </div>

              {/* Menu items */}
              {[
                { icon: '◈', label: 'Profile', action: () => { navigate('/settings'); setDropdownOpen(false) } },
                { icon: '◧', label: 'Settings', action: () => { navigate('/settings'); setDropdownOpen(false) } },
                { icon: '◑', label: 'Roles & Access', action: () => { navigate('/roles'); setDropdownOpen(false) } },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                  }}
                  className="hover:bg-hover hover:text-primary"
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                className="hover:bg-hover"
              >
                <span style={{ fontSize: 14 }}>⬡</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}