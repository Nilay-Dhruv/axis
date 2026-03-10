import { useState, type ReactElement } from 'react'
import { useActivities } from '../hooks/useActivities'
import { useDepartments } from '../hooks/useDepartments'
// import ActivityCard from '../components/activities/ActivityCard'
import ActivityTypeBadge from '../components/activities/ActivityTypeBadge'
import ActivityLogRow from '../components/activities/ActivityLogRow'
import ExecuteModal from '../components/activities/ExecuteModal'
// import SkeletonCard from '../components/common/SkeletonCard'
import type { Activity, ActivityLog } from '../types/department'

const TYPE_FILTERS = [
  { value: 'all',      label: 'All Types' },
  { value: 'track',    label: 'Track'     },
  { value: 'approve',  label: 'Approve'   },
  { value: 'review',   label: 'Review'    },
  { value: 'execute',  label: 'Execute'   },
  { value: 'report',   label: 'Report'    },
  { value: 'monitor',  label: 'Monitor'   },
]

export default function Activities(): ReactElement {
  const {
    filteredList,
    grouped,
    recentLogs,
    loading,
    executing,
    executeError,
    searchQuery,
    filterDept,
    filterType,
    execute,
    search,
    filterByDept,
    filterByType,
    clearExecError,
    refetch,
  } = useActivities(true)

  const { departments } = useDepartments()
  const [execActivity, setExecActivity]   = useState<Activity | null>(null)
  // const [selectedActivity, setSelected]   = useState<string | null>(null)
  const [execSuccess, setExecSuccess]     = useState<string | null>(null)

  const handleExecute = async (notes: string) => {
    if (!execActivity) return
    const result = await execute(execActivity.id, notes)
    if ((result as { meta: { requestStatus: string } }).meta.requestStatus === 'fulfilled') {
      setExecSuccess(`"${execActivity.name}" executed successfully`)
      setExecActivity(null)
      setTimeout(() => setExecSuccess(null), 4000)
    }
  }

  const totalActivities = filteredList.length
  const deptIds = Object.keys(grouped)

  return (
    <div className="animate-fade-slide">

      {/* ── Page Header ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Operational Execution
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {totalActivities} activit{totalActivities !== 1 ? 'ies' : 'y'} across{' '}
            {deptIds.length} department{deptIds.length !== 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={refetch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
            letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}
          className="hover:border-border-bright hover:text-primary"
        >
          <span style={{ fontSize: 14 }}>↻</span>
          REFRESH
        </button>
      </div>

      {/* ── Success Toast ─────────────────────────────────── */}
      {execSuccess && (
        <div
          style={{
            background: 'rgba(0,204,136,0.08)',
            border: '1px solid rgba(0,204,136,0.3)',
            borderRadius: 7,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--success)',
            fontSize: 13,
            animation: 'fadeSlideIn 0.2s ease',
          }}
        >
          <span>◆</span>
          {execSuccess}
        </div>
      )}

      {/* ── Search + Filters ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 13,
              pointerEvents: 'none',
            }}
          >
            ◎
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => search(e.target.value)}
            placeholder="Search activities..."
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 7,
              padding: '9px 12px 9px 34px',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--cyan)' }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>

        {/* Dept filter */}
        <select
          value={filterDept}
          onChange={(e) => filterByDept(e.target.value)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '9px 12px',
            color: 'var(--text-secondary)',
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
          }}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => filterByType(opt.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 7,
                border: `1px solid ${filterType === opt.value ? 'var(--cyan)' : 'var(--border)'}`,
                background: filterType === opt.value ? 'var(--cyan-glow)' : 'var(--bg-surface)',
                color: filterType === opt.value ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'Rajdhani',
                fontWeight: 600,
                letterSpacing: '0.06em',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Grid: Activities + Logs ─────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 20,
          alignItems: 'start',
        }}
      >

        {/* ── Activities List ── */}
        <div>
          {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3, 4, 5].map((k) => (
                  <div
                    key={k}
                    style={{
                      background: 'var(--neu-bg)',
                      borderRadius: 16,
                      boxShadow: 'var(--neu-shadow-out)',
                      padding: '18px 22px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                      animation: 'pulse 1.4s ease-in-out infinite',
                    }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{
                        height: 13, width: '45%', borderRadius: 5,
                        background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }} />
                      <div style={{
                        height: 10, width: '30%', borderRadius: 5,
                        background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }} />
                    </div>
                    <div style={{
                      width: 60, height: 24, borderRadius: 20,
                      background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                      animation: 'pulse 1.4s ease-in-out infinite',
                    }} />
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* ── Right: Execution Log Panel ── */}
        <div style={{ position: 'sticky', top: 84 }}>

          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              { label: 'Total',    value: filteredList.length,                              color: 'var(--cyan)'    },
              { label: 'Logs',     value: recentLogs.length,                                color: 'var(--success)' },
              { label: 'Depts',    value: deptIds.length,                                   color: 'var(--warning)' },
              { label: 'Executed', value: recentLogs.filter((l: { status: string }) => l.status === 'completed').length, color: '#8866ff' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  padding: '12px 14px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Recent execution logs */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Execution Log
              </span>
              {recentLogs.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--success)',
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                  }}
                >
                  {recentLogs.length} entries
                </span>
              )}
            </div>

            <div style={{ padding: '4px 16px', maxHeight: 420, overflowY: 'auto' }}>
              {recentLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 0',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.2 }}>◎</div>
                  No executions yet.
                  <br />
                  Click ▶ RUN on any activity.
                </div>
              ) : (
                recentLogs.map((log: ActivityLog) => (
                  <ActivityLogRow key={log.id} log={log} />
                ))
              )}
            </div>
          </div>

          {/* Type breakdown */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '14px 16px',
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              By Type
            </div>
            {TYPE_FILTERS.filter((f) => f.value !== 'all').map((opt) => {
              const count = filteredList.filter((a: { type: string }) => a.type === opt.value).length
              if (count === 0) return null
              return (
                <div
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <ActivityTypeBadge type={opt.value} />
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: 'var(--border)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(count / filteredList.length) * 100}%`,
                        background: 'var(--cyan)',
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'Rajdhani',
                      fontWeight: 600,
                      width: 16,
                      textAlign: 'right',
                    }}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Execute Modal ─────────────────────────────────── */}
      {execActivity && (
        <ExecuteModal
          activity={execActivity}
          onConfirm={handleExecute}
          onClose={() => {
            setExecActivity(null)
            clearExecError()
          }}
          executing={executing}
          error={executeError}
        />
      )}
    </div>
  )
}