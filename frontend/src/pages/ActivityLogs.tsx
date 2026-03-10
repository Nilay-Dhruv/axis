// frontend/src/pages/ActivityLogs.tsx
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import activityLogService, { ActivityLog, LogFilters } from '../services/activityLogService'
import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusType = '' | 'success' | 'failed' | 'pending'

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_FILTERS: { label: string; value: StatusType }[] = [
  { label: 'All',     value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Failed',  value: 'failed' },
  { label: 'Pending', value: 'pending' },
]

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; dot: string; text: string }> = {
    success: { bg: 'rgba(16,185,129,0.1)', dot: '#10b981', text: '#065f46' },
    failed:  { bg: 'rgba(239,68,68,0.1)',  dot: '#ef4444', text: '#991b1b' },
    pending: { bg: 'rgba(245,158,11,0.1)', dot: '#f59e0b', text: '#92400e' },
  }
  const s = map[status] ?? { bg: 'rgba(100,116,139,0.1)', dot: '#64748b', text: '#334155' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, borderRadius: 6,
      padding: '3px 10px', fontSize: 11, fontWeight: 600,
      color: s.text, textTransform: 'capitalize', letterSpacing: '0.02em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  )
}

// ─── Expanded Detail Row ──────────────────────────────────────────────────────
const LogRowDetail = ({ log }: { log: ActivityLog }) => (
  <tr>
    <td colSpan={6} style={{ padding: 0 }}>
      <div style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)',
        borderTop: '1px solid rgba(14,165,233,0.15)',
        borderBottom: '1px solid rgba(14,165,233,0.1)',
        padding: '16px 24px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      }}>
        {/* Notes */}
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            Execution Notes
          </p>
          {log.notes ? (
            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{log.notes}</p>
          ) : (
            <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No notes provided</p>
          )}
        </div>

        {/* Result Data */}
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            Result Data
          </p>
          {log.result_data && Object.keys(log.result_data).length > 0 ? (
            <pre style={{
              fontSize: 11, background: '#0f172a', color: '#34d399',
              borderRadius: 8, padding: '10px 14px',
              overflowX: 'auto', maxHeight: 120, margin: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 1.6,
            }}>
              {JSON.stringify(log.result_data, null, 2)}
            </pre>
          ) : (
            <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No result data</p>
          )}
        </div>
      </div>
    </td>
  </tr>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ActivityLogs() {
  const [logs, setLogs]               = useState<ActivityLog[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters]         = useState<LogFilters>({ page: 1, per_page: 20 })
  const [activeStatus, setActiveStatus] = useState<StatusType>('')
  const [pagination, setPagination]   = useState({
    total: 0, pages: 1, current_page: 1, has_next: false, has_prev: false,
  })
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // ── Fetch logs ──────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await activityLogService.getLogs(filters)
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch logs', err)
      setError('Failed to load activity logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // ── Fetch departments ───────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/departments')
      .then(res => {
        const data = res.data.data ?? res.data
        setDepartments(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error('Failed to fetch departments', err))
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const updateFilter = (key: keyof LogFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleStatusFilter = (val: StatusType) => {
    setActiveStatus(val)
    updateFilter('status', val)
  }

  const resetFilters = () => {
    setFilters({ page: 1, per_page: 20 })
    setActiveStatus('')
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    border: '1.5px solid rgba(148,163,184,0.3)',
    borderRadius: 10,
    padding: '8px 13px',
    fontSize: 13,
    color: '#334155',
    background: 'white',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'border-color 0.2s',
    minWidth: 0,
  }

  const pillBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    border: '1.5px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.01em',
  }

  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: '#0ea5e9',
    color: 'white',
    borderColor: '#0ea5e9',
  }

  const pillInactive: React.CSSProperties = {
    ...pillBase,
    background: 'white',
    color: '#64748b',
    borderColor: 'rgba(148,163,184,0.3)',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
        }}>
          EXECUTION HISTORY
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {pagination.total} log entr{pagination.total !== 1 ? 'ies' : 'y'} across all departments
          </p>
          <button
            onClick={fetchLogs}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1.5px solid rgba(148,163,184,0.3)',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#64748b',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      {/* ── Filters Card ── */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.2)',
        boxShadow: '0 2px 12px rgba(14,165,233,0.06)',
        padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>

          {/* Department dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Department
            </label>
            <select
              style={{ ...inputStyle, minWidth: 160 }}
              onChange={e => updateFilter('department_id', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              From Date
            </label>
            <input
              type="date"
              style={inputStyle}
              onChange={e => updateFilter('date_from', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              To Date
            </label>
            <input
              type="date"
              style={inputStyle}
              onChange={e => updateFilter('date_to', e.target.value)}
            />
          </div>

          {/* Per page */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Per Page
            </label>
            <select
              style={{ ...inputStyle, minWidth: 110 }}
              value={filters.per_page}
              onChange={e => updateFilter('per_page', Number(e.target.value))}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            style={{
              ...pillInactive,
              marginTop: 'auto',
            }}
          >
            Reset
          </button>
        </div>

        {/* Status pill filters — same style as Activities page type pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              onClick={() => handleStatusFilter(s.value)}
              style={activeStatus === s.value ? pillActive : pillInactive}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 16,
          fontSize: 13, color: '#dc2626',
        }}>
          {error}
        </div>
      )}

      {/* ── Table Card ── */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.2)',
        boxShadow: '0 2px 12px rgba(14,165,233,0.06)',
        overflow: 'hidden',
      }}>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid rgba(148,163,184,0.15)',
        }}>
          {[
            { label: 'TOTAL LOGS',  value: pagination.total },
            { label: 'THIS PAGE',   value: logs.length },
            { label: 'PAGE',        value: `${pagination.current_page} / ${pagination.pages}` },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: '14px 24px',
              borderRight: i < 2 ? '1px solid rgba(148,163,184,0.15)' : 'none',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
            <div style={{
              width: 28, height: 28,
              border: '2.5px solid rgba(14,165,233,0.2)',
              borderTopColor: '#0ea5e9',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Loading logs...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

        ) : logs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 4,
            }}>📋</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#334155', margin: 0 }}>No activity logs found</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Try adjusting your filters or execute some activities first</p>
          </div>

        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                {['Activity', 'Department', 'Executed By', 'Status', 'Date & Time', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '11px 20px',
                    fontSize: 10, fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: '#f8fafc',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      style={{
                        borderBottom: '1px solid rgba(148,163,184,0.1)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: expandedRow === log.id ? 'rgba(14,165,233,0.04)' : 'white',
                      }}
                    >
                      {/* Activity name */}
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                          {log.activity_name ?? '—'}
                        </span>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#0ea5e9',
                          background: 'rgba(14,165,233,0.08)',
                          padding: '3px 9px',
                          borderRadius: 5,
                        }}>
                          {log.department_name ?? '—'}
                        </span>
                      </td>

                      {/* Executed by */}
                      <td style={{ padding: '13px 20px' }}>
                        <span>{log.executor_name ?? '—'}</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 20px' }}>
                        <StatusBadge status={log.status} />
                      </td>

                      {/* Date */}
                      <td style={{ padding: '13px 20px' }}>
                        {log.executed_at
                          ? new Date(log.executed_at).toLocaleString()
                          : '—'}
                      </td>

                      {/* Expand toggle */}
                      <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                        {expandedRow === log.id ? '▲ HIDE' : '▼ DETAILS'}
                      </td>
                    </tr>

                    {expandedRow === log.id && <LogRowDetail log={log} />}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        )}

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid rgba(148,163,184,0.15)',
            background: '#f8fafc',
          }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Page <strong>{pagination.current_page}</strong> of <strong>{pagination.pages}</strong> — {pagination.total} total records
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={!pagination.has_prev}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
                style={{
                  ...pillInactive,
                  opacity: pagination.has_prev ? 1 : 0.4,
                  cursor: pagination.has_prev ? 'pointer' : 'not-allowed',
                }}
              >
                ← Previous
              </button>
              <button
                disabled={!pagination.has_next}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
                style={{
                  ...pillActive,
                  opacity: pagination.has_next ? 1 : 0.4,
                  cursor: pagination.has_next ? 'pointer' : 'not-allowed',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}