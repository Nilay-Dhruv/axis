import { useEffect, useState, type ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { fetchRoles, fetchPermissionMatrix, fetchMyPermissions } from '../store/roleSlice'
import type { Role } from '../types/department'

// ── Permission resource icons ─────────────────────────────────────────────
const RESOURCE_ICONS: Record<string, string> = {
  Departments: '◉',
  Activities:  '◎',
  Outcomes:    '◆',
  Signals:     '▲',
  Roles:       '◧',
  Analytics:   '◷',
  Settings:    '◫',
  Users:       '◉',
}

// ── Tier config ───────────────────────────────────────────────────────────
const TIER_CFG: Record<string, { label: string; badgeClass: string }> = {
  free:          { label: 'Free',    badgeClass: 'neu-badge-gray'   },
  basic_premium: { label: 'Basic',   badgeClass: 'neu-badge-blue'   },
  premium:       { label: 'Pro',     badgeClass: 'neu-badge-purple' },
}

// ── Role Card ──────────────────────────────────────────────────────────────
function RoleCard({ role, isSelected, onClick }: {
  role: Role
  isSelected: boolean
  onClick: () => void
}): ReactElement {
  const tier = TIER_CFG[role.tier_required] ?? TIER_CFG.free
  const permCount = role.permissions.length

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#e6ecf3',
        borderRadius: 18,
        boxShadow: isSelected
          ? 'inset 5px 5px 12px #c3cdd8, inset -5px -5px 12px #ffffff'
          : '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
        padding: '20px 22px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar when selected */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #5aa9c4, #7ec8e3)',
          borderRadius: '18px 18px 0 0',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 15,
            color: isSelected ? '#5aa9c4' : '#1a2635',
            marginBottom: 4, letterSpacing: '-0.1px',
            transition: 'color 0.2s',
          }}>
            {role.name}
          </div>
          {role.description && (
            <div style={{ fontSize: 12, color: '#8096aa', lineHeight: 1.5, maxWidth: 240 }}>
              {role.description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span className={`neu-badge ${tier.badgeClass}`}>{tier.label}</span>
          {role.is_system && (
            <span className="neu-badge neu-badge-gray" style={{ fontSize: 9, letterSpacing: '0.5px' }}>
              SYSTEM
            </span>
          )}
        </div>
      </div>

      {/* Permission count bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#8096aa' }}>Permissions</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#5aa9c4' }}>{permCount}</span>
        </div>
        <div className="neu-progress-track">
          <div
            className="neu-progress-fill"
            style={{ width: `${Math.min((permCount / 28) * 100, 100)}%` }}
          />
        </div>
      </div>
    </button>
  )
}

// ── Permission Group ───────────────────────────────────────────────────────
function PermissionGroup({ resource, perms, rolePerms }: {
  resource: string
  perms: string[]
  rolePerms: string[]
  readOnly?: boolean
}): ReactElement {
  const icon = RESOURCE_ICONS[resource] ?? '◇'
  const granted = perms.filter((p) => rolePerms.includes(p))

  return (
    <div style={{
      background: '#e6ecf3',
      borderRadius: 14,
      boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      {/* Resource header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ color: '#5aa9c4', fontSize: 14 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1a2635', letterSpacing: '0.3px' }}>
          {resource}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10, fontWeight: 700, color: '#5aa9c4',
          background: 'rgba(90,169,196,0.1)',
          padding: '2px 7px', borderRadius: 30,
        }}>
          {granted.length}/{perms.length}
        </span>
      </div>

      {/* Permission pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {perms.map((perm) => {
          const action  = perm.split('.')[1] ?? perm
          const has     = rolePerms.includes(perm)
          return (
            <span key={perm} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 30,
              fontSize: 11, fontWeight: 600,
              background: has ? '#e6f7f0' : '#eef1f5',
              color: has ? '#1e9e60' : '#8096aa',
              border: `1px solid ${has ? '#b8e8d0' : '#d4e0ec'}`,
              transition: 'all 0.15s',
            }}>
              {has ? '✓' : '○'} {action}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Roles(): ReactElement {
  const dispatch    = useDispatch<AppDispatch>()
  const list        = useSelector((s: RootState) => s.roles.list)
  const matrix      = useSelector((s: RootState) => s.roles.permissionMatrix)
  const myPerms     = useSelector((s: RootState) => s.roles.myPermissions)
  const loading     = useSelector((s: RootState) => s.roles.loading)
  const error       = useSelector((s: RootState) => s.roles.error)

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [activeTab, setActiveTab]       = useState<'roles' | 'my-perms'>('roles')

  useEffect(() => {
    dispatch(fetchRoles())
    dispatch(fetchPermissionMatrix())
    dispatch(fetchMyPermissions())
  }, [])

  const systemRoles = list.filter((r) => r.is_system)
  const customRoles = list.filter((r) => !r.is_system)

  return (
    <div className="neu-fade-up">

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a2635', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Roles & Permissions
        </h1>
        <p style={{ fontSize: 13, color: '#8096aa' }}>
          Manage access control across your organization
        </p>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['roles', 'my-perms'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`neu-pill ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'roles' ? '◧ All Roles' : '◎ My Permissions'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#eaf4fb', borderRadius: 30, padding: '6px 14px',
          fontSize: 11, fontWeight: 700, color: '#5aa9c4',
        }}>
          {list.length} roles · {Object.values(matrix).flat().length} permissions
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#fdeaea', border: '1px solid #f5c6c6',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          fontSize: 12, color: '#b92c2c', display: 'flex', gap: 8, alignItems: 'center',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── TAB: ALL ROLES ── */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedRole ? 'minmax(0,1fr) 380px' : '1fr', gap: 20, alignItems: 'start' }}>

          {/* Role list */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div className="neu-spinner" />
              </div>
            ) : (
              <>
                {/* System roles */}
                {systemRoles.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', color: '#8096aa', marginBottom: 12, textTransform: 'uppercase' }}>
                      System Roles
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {systemRoles.map((role) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          isSelected={selectedRole?.id === role.id}
                          onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom roles */}
                {customRoles.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', color: '#8096aa', marginBottom: 12, textTransform: 'uppercase' }}>
                      Custom Roles
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {customRoles.map((role) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          isSelected={selectedRole?.id === role.id}
                          onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {list.length === 0 && !loading && (
                  <div style={{
                    textAlign: 'center', padding: '60px 24px',
                    background: '#e6ecf3', borderRadius: 20,
                    boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
                  }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>◧</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#4a5e72', marginBottom: 6 }}>No roles yet</div>
                    <div style={{ fontSize: 13, color: '#8096aa' }}>Roles will seed automatically.</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Role detail panel */}
          {selectedRole && (
            <div style={{ position: 'sticky', top: 88 }}>
              <div style={{
                background: '#e6ecf3',
                borderRadius: 20,
                boxShadow: '8px 8px 20px #c3cdd8, -8px -8px 20px #ffffff',
                overflow: 'hidden',
                animation: 'fadeSlideIn 0.25s ease',
              }}>
                {/* Panel header */}
                <div style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid var(--divider)',
                  background: 'rgba(90,169,196,0.06)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2635', marginBottom: 4 }}>
                      {selectedRole.name}
                    </div>
                    <span className={`neu-badge ${TIER_CFG[selectedRole.tier_required]?.badgeClass ?? 'neu-badge-gray'}`}>
                      {TIER_CFG[selectedRole.tier_required]?.label} tier
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRole(null)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: '#e6ecf3',
                      boxShadow: '3px 3px 8px #c3cdd8, -3px -3px 8px #ffffff',
                      border: 'none', cursor: 'pointer',
                      color: '#8096aa', fontSize: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--divider)' }}>
                  {[
                    { label: 'Permissions', value: selectedRole.permissions.length },
                    { label: 'Members', value: '—' },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: '14px 18px', textAlign: 'center',
                      borderRight: i === 0 ? '1px solid var(--divider)' : 'none',
                    }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#5aa9c4', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#8096aa', marginTop: 3, fontWeight: 600 }}>{s.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>

                {/* Permissions matrix */}
                <div style={{ padding: '16px 18px', maxHeight: 420, overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: '#8096aa', textTransform: 'uppercase', marginBottom: 12 }}>
                    Permission Matrix
                  </div>
                  {Object.entries(matrix).map(([resource, perms]) => (
                    <PermissionGroup
                      key={resource}
                      resource={resource}
                      perms={perms}
                      rolePerms={selectedRole.permissions}
                    />
                  ))}
                </div>

                {/* System lock notice */}
                {selectedRole.is_system && (
                  <div style={{
                    padding: '12px 18px',
                    borderTop: '1px solid var(--divider)',
                    background: '#fef9e7',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 11, color: '#d4870a',
                  }}>
                    🔒 System roles are read-only and cannot be modified
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: MY PERMISSIONS ── */}
      {activeTab === 'my-perms' && (
        <div>
          {/* Summary card */}
          <div style={{
            background: '#e6ecf3',
            borderRadius: 20,
            boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
            padding: '22px 24px',
            marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7ec8e3, #5aa9c4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: 'white',
              boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
              flexShrink: 0,
            }}>
              ◎
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2635', marginBottom: 4 }}>
                Your Effective Permissions
              </div>
              <div style={{ fontSize: 13, color: '#8096aa' }}>
                {myPerms.length} permission{myPerms.length !== 1 ? 's' : ''} granted across all assigned roles
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              background: '#e6ecf3',
              borderRadius: 14,
              boxShadow: 'inset 4px 4px 10px #c3cdd8, inset -4px -4px 10px #ffffff',
              padding: '12px 20px',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#5aa9c4', lineHeight: 1 }}>
                {myPerms.length}
              </div>
              <div style={{ fontSize: 9, color: '#8096aa', fontWeight: 700, letterSpacing: '0.5px' }}>GRANTED</div>
            </div>
          </div>

          {/* Permission groups */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {Object.entries(matrix).map(([resource, perms]) => (
              <PermissionGroup
                key={resource}
                resource={resource}
                perms={perms}
                rolePerms={myPerms}
              />
            ))}
          </div>

          {myPerms.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: '#e6ecf3', borderRadius: 20,
              boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
              marginTop: 12,
            }}>
              <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.3 }}>◧</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#4a5e72', marginBottom: 6 }}>
                No permissions assigned
              </div>
              <div style={{ fontSize: 13, color: '#8096aa' }}>
                Ask your admin to assign a role to your account.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}