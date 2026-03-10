import { useState, useEffect, type ReactElement } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import settingsService from '../services/settingsService'
import type { AxiosError } from 'axios'

// ─── Sub-components defined OUTSIDE main component ───────────────────────────

interface SectionProps {
  title: string
  subtitle?: string
  children: ReactElement | ReactElement[]
}

function SettingsSection({ title, subtitle, children }: SectionProps): ReactElement {
  return (
    <div
      style={{
        background: 'var(--neu-bg)',
        borderRadius: 16,
        padding: '28px 32px',
        boxShadow: 'var(--neu-shadow-out)',
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--neu-divider)' }}>
        <div
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.08em',
            color: 'var(--neu-text-dark)',
            textTransform: 'uppercase',
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--neu-text-light)' }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  )
}

interface NeuInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  hint?: string
}

function NeuInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  hint,
}: NeuInputProps): ReactElement {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'var(--neu-text-mid)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: 10,
          border: 'none',
          outline: 'none',
          background: 'var(--neu-bg)',
          boxShadow: focused
            ? `var(--neu-shadow-in), 0 0 0 2px var(--neu-accent)`
            : 'var(--neu-shadow-in)',
          color: disabled ? 'var(--neu-text-light)' : 'var(--neu-text-dark)',
          fontSize: 14,
          transition: 'box-shadow 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.7 : 1,
          boxSizing: 'border-box',
        }}
      />
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--neu-text-light)', marginTop: 5 }}>
          {hint}
        </div>
      )}
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid var(--neu-divider)',
      }}
    >
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neu-text-dark)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'var(--neu-text-light)' }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          background: checked ? 'var(--neu-accent)' : 'transparent',
          boxShadow: checked ? 'none' : 'var(--neu-shadow-in)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.25s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: checked ? '#fff' : 'var(--neu-text-light)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            transition: 'left 0.25s ease',
          }}
        />
      </button>
    </div>
  )
}

interface StatusBadgeProps {
  tier: string
}

function TierBadge({ tier }: StatusBadgeProps): ReactElement {
  const cfg =
    tier === 'premium'
      ? { label: 'PREMIUM', color: '#7ec8e3', bg: 'rgba(94,169,196,0.12)' }
      : tier === 'basic_premium'
      ? { label: 'BASIC', color: '#5aa9c4', bg: 'rgba(90,169,196,0.10)' }
      : { label: 'FREE', color: 'var(--neu-text-light)', bg: 'transparent' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 12px',
        background: cfg.bg,
        border: `1px solid ${cfg.color}60`,
        borderRadius: 20,
        fontSize: 10,
        color: cfg.color,
        fontFamily: 'Rajdhani',
        fontWeight: 700,
        letterSpacing: '0.15em',
      }}
    >
      ◆ {cfg.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'profile' | 'security' | 'notifications' | 'appearance'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: '◉' },
  { id: 'security',      label: 'Security',       icon: '◧' },
  { id: 'notifications', label: 'Notifications',  icon: '▲' },
  { id: 'appearance',    label: 'Appearance',     icon: '◈' },
]

export default function Settings(): ReactElement {
  const authUser = useSelector((s: RootState) => s.auth.user)

  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile state
  const [fullName, setFullName]         = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError]   = useState<string | null>(null)

  // Password state
  const [currentPw, setCurrentPw]     = useState('')
  const [newPw, setNewPw]             = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [pwSaving, setPwSaving]       = useState(false)
  const [pwSuccess, setPwSuccess]     = useState(false)
  const [pwError, setPwError]         = useState<string | null>(null)

  // Notification preferences (local only — no backend yet)
  const [notifs, setNotifs] = useState({
    emailAlerts:      true,
    signalCritical:   true,
    signalWarning:    true,
    weeklyDigest:     false,
    activityUpdates:  true,
    outcomeAchieved:  true,
  })

  // Appearance preferences (local only)
  const [appearance, setAppearance] = useState({
    compactMode:     false,
    showAnimations:  true,
    sidebarCollapsed: false,
  })

  useEffect(() => {
    if (authUser?.full_name) setFullName(authUser.full_name)
  }, [authUser])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      await settingsService.updateProfile(fullName)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      setProfileError(error.response?.data?.error?.message ?? 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwSaving(true)
    setPwError(null)
    setPwSuccess(false)
    try {
      await settingsService.changePassword(currentPw, newPw, confirmPw)
      setPwSuccess(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      setPwError(error.response?.data?.error?.message ?? 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const tier = authUser?.subscription_tier ?? 'free'

  return (
    <div className="neu-fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--neu-text-light)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          System Configuration
        </div>
        <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
          Manage your account, security, and preferences
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 28,
          background: 'var(--neu-bg)',
          borderRadius: 12,
          padding: 6,
          boxShadow: 'var(--neu-shadow-in)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? 'var(--neu-bg)' : 'transparent',
              boxShadow: activeTab === tab.id ? 'var(--neu-shadow-out)' : 'none',
              color: activeTab === tab.id ? 'var(--neu-accent)' : 'var(--neu-text-mid)',
              fontSize: 12,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 12 }}>{tab.icon}</span>
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ──────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div>
          <SettingsSection
            title="Account Information"
            subtitle="Your identity and subscription details"
          >
            <>
              {/* Avatar + tier row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  marginBottom: 28,
                  padding: '18px 20px',
                  borderRadius: 12,
                  background: 'var(--neu-bg)',
                  boxShadow: 'var(--neu-shadow-in)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-out)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    color: 'var(--neu-accent)',
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(authUser?.full_name ?? 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'Rajdhani',
                      fontWeight: 700,
                      fontSize: 17,
                      color: 'var(--neu-text-dark)',
                      marginBottom: 4,
                    }}
                  >
                    {authUser?.full_name ?? '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--neu-text-light)', marginBottom: 8 }}>
                    {authUser?.email ?? '—'}
                  </div>
                  <TierBadge tier={tier} />
                </div>
              </div>

              <NeuInput
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Your full name"
              />
              <NeuInput
                label="Email Address"
                value={authUser?.email ?? ''}
                onChange={() => {}}
                disabled
                hint="Email cannot be changed. Contact support if needed."
              />
              <NeuInput
                label="Subscription Tier"
                value={tier.replace('_', ' ').toUpperCase()}
                onChange={() => {}}
                disabled
                hint="Upgrade your plan to unlock premium features."
              />

              {/* Feedback */}
              {profileError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(180,70,70,0.08)',
                    border: '1px solid rgba(180,70,70,0.25)',
                    color: '#b44646',
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  ⚠ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(70,140,100,0.08)',
                    border: '1px solid rgba(70,140,100,0.25)',
                    color: '#468c64',
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  ◆ Profile updated successfully
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving || !fullName.trim()}
                className="neu-btn-primary"
                style={{ minWidth: 160 }}
              >
                {profileSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </>
          </SettingsSection>

          {/* Subscription info */}
          <SettingsSection
            title="Subscription"
            subtitle="Your current plan and feature access"
          >
            <>
              {[
                { feature: 'Default Departments (6)',  free: true,  basic: true,  pro: true  },
                { feature: 'Custom Departments',       free: false, basic: false, pro: true  },
                { feature: 'Activities & Execution',   free: true,  basic: true,  pro: true  },
                { feature: 'Premium Activities',       free: false, basic: true,  pro: true  },
                { feature: 'Outcomes & Signals',       free: true,  basic: true,  pro: true  },
                { feature: 'Analytics Dashboard',      free: true,  basic: true,  pro: true  },
                { feature: 'Custom Role Creation',     free: false, basic: true,  pro: true  },
                { feature: 'Role Assignment',          free: false, basic: true,  pro: true  },
                { feature: 'Automations',              free: false, basic: false, pro: true  },
                { feature: 'Simulations',              free: false, basic: false, pro: true  },
              ].map((row) => {
                const isAdmin = authUser?.email?.toLowerCase().includes('admin') ||
                tier === 'premium'

              const hasAccess = isAdmin
                ? true  // admins get everything
                : tier === 'basic_premium'
                ? row.basic
                : row.free

                return (
                  <div
                    key={row.feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--neu-divider)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
                      {row.feature}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: hasAccess ? '#468c64' : 'var(--neu-text-light)',
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {hasAccess ? '✓ INCLUDED' : '— LOCKED'}
                    </span>
                  </div>
                )
              })}

              {tier !== 'premium' && (
                <div style={{ marginTop: 20 }}>
                  <button
                    className="neu-btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => window.open('mailto:support@axis.io?subject=Upgrade Inquiry', '_blank')}
                  >
                    ◆ UPGRADE PLAN
                  </button>
                </div>
              )}
            </>
          </SettingsSection>
        </div>
      )}

      {/* ── Security Tab ─────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <SettingsSection
          title="Change Password"
          subtitle="Use a strong password with at least 8 characters"
        >
          <>
            <NeuInput
              label="Current Password"
              value={currentPw}
              onChange={setCurrentPw}
              type="password"
              placeholder="Enter current password"
            />
            <NeuInput
              label="New Password"
              value={newPw}
              onChange={setNewPw}
              type="password"
              placeholder="At least 8 characters"
            />
            <NeuInput
              label="Confirm New Password"
              value={confirmPw}
              onChange={setConfirmPw}
              type="password"
              placeholder="Repeat new password"
            />

            {/* Password strength indicator */}
            {newPw.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--neu-text-light)',
                    marginBottom: 6,
                  }}
                >
                  PASSWORD STRENGTH
                </div>
                <div
                  style={{
                    height: 4,
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-in)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width:
                        newPw.length >= 12 ? '100%' :
                        newPw.length >= 8  ? '65%'  :
                        newPw.length >= 5  ? '35%'  : '15%',
                      background:
                        newPw.length >= 12 ? '#468c64' :
                        newPw.length >= 8  ? 'var(--neu-accent)' :
                        newPw.length >= 5  ? '#c4a45a' : '#b44646',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color:
                      newPw.length >= 12 ? '#468c64' :
                      newPw.length >= 8  ? 'var(--neu-accent)' :
                      newPw.length >= 5  ? '#c4a45a' : '#b44646',
                    marginTop: 4,
                    fontFamily: 'Rajdhani',
                    fontWeight: 600,
                  }}
                >
                  {newPw.length >= 12 ? 'Strong' :
                   newPw.length >= 8  ? 'Good' :
                   newPw.length >= 5  ? 'Weak' : 'Too short'}
                </div>
              </div>
            )}

            {pwError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(180,70,70,0.08)',
                  border: '1px solid rgba(180,70,70,0.25)',
                  color: '#b44646',
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                ⚠ {pwError}
              </div>
            )}
            {pwSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(70,140,100,0.08)',
                  border: '1px solid rgba(70,140,100,0.25)',
                  color: '#468c64',
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                ◆ Password changed successfully
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwSaving || !currentPw || !newPw || !confirmPw}
              className="neu-btn-primary"
              style={{ minWidth: 180 }}
            >
              {pwSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </>
        </SettingsSection>
      )}

      {/* ── Notifications Tab ────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <SettingsSection
          title="Notification Preferences"
          subtitle="Control what alerts and updates you receive"
        >
          <>
            <ToggleRow
              label="Email Alerts"
              description="Receive important alerts via email"
              checked={notifs.emailAlerts}
              onChange={(v) => setNotifs((p) => ({ ...p, emailAlerts: v }))}
            />
            <ToggleRow
              label="Critical Signal Alerts"
              description="Get notified when a signal enters critical state"
              checked={notifs.signalCritical}
              onChange={(v) => setNotifs((p) => ({ ...p, signalCritical: v }))}
            />
            <ToggleRow
              label="Warning Signal Alerts"
              description="Get notified when a signal enters warning state"
              checked={notifs.signalWarning}
              onChange={(v) => setNotifs((p) => ({ ...p, signalWarning: v }))}
            />
            <ToggleRow
              label="Weekly Digest"
              description="A weekly summary of outcomes, activities, and signals"
              checked={notifs.weeklyDigest}
              onChange={(v) => setNotifs((p) => ({ ...p, weeklyDigest: v }))}
            />
            <ToggleRow
              label="Activity Execution Updates"
              description="Notify when team members execute activities"
              checked={notifs.activityUpdates}
              onChange={(v) => setNotifs((p) => ({ ...p, activityUpdates: v }))}
            />
            <ToggleRow
              label="Outcome Achieved"
              description="Celebrate when an outcome reaches its target"
              checked={notifs.outcomeAchieved}
              onChange={(v) => setNotifs((p) => ({ ...p, outcomeAchieved: v }))}
            />

            <div
              style={{
                marginTop: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--neu-bg)',
                boxShadow: 'var(--neu-shadow-in)',
                fontSize: 11,
                color: 'var(--neu-text-light)',
                lineHeight: 1.6,
              }}
            >
              ◈ Notification delivery via email is coming in a future update. These preferences will be applied then.
            </div>
          </>
        </SettingsSection>
      )}

      {/* ── Appearance Tab ───────────────────────────────────────── */}
      {activeTab === 'appearance' && (
        <div>
          <SettingsSection
            title="Display Preferences"
            subtitle="Customize how AXIS looks and behaves"
          >
            <>
              <ToggleRow
                label="Compact Mode"
                description="Reduce spacing and padding for denser information display"
                checked={appearance.compactMode}
                onChange={(v) => setAppearance((p) => ({ ...p, compactMode: v }))}
              />
              <ToggleRow
                label="Animations"
                description="Enable fade and slide transitions across the interface"
                checked={appearance.showAnimations}
                onChange={(v) => setAppearance((p) => ({ ...p, showAnimations: v }))}
              />
              <ToggleRow
                label="Collapsed Sidebar by Default"
                description="Start with the sidebar collapsed for more screen space"
                checked={appearance.sidebarCollapsed}
                onChange={(v) => setAppearance((p) => ({ ...p, sidebarCollapsed: v }))}
              />
            </>
          </SettingsSection>

          <SettingsSection
            title="Design System"
            subtitle="Current theme: Neumorphic soft blue-grey"
          >
            <>
              {/* Color palette preview */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: 'var(--neu-text-light)',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  Active Palette
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Background', color: '#e6ecf3' },
                    { label: 'Accent',     color: '#5aa9c4' },
                    { label: 'Accent Lt',  color: '#7ec8e3' },
                    { label: 'Text Dark',  color: '#1a2635' },
                    { label: 'Text Mid',   color: '#4a5e72' },
                    { label: 'Divider',    color: '#d4e0ec' },
                  ].map((swatch) => (
                    <div
                      key={swatch.label}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: swatch.color,
                          boxShadow: 'var(--neu-shadow-out)',
                        }}
                      />
                      <div
                        style={{
                          fontSize: 9,
                          color: 'var(--neu-text-light)',
                          fontFamily: 'Rajdhani',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textAlign: 'center',
                        }}
                      >
                        {swatch.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--neu-bg)',
                  boxShadow: 'var(--neu-shadow-in)',
                  fontSize: 11,
                  color: 'var(--neu-text-light)',
                  lineHeight: 1.6,
                }}
              >
                ◈ Additional themes (dark mode, high contrast) are planned for a future update.
              </div>
            </>
          </SettingsSection>
        </div>
      )}
    </div>
  )
}