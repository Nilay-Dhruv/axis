import { useState, type ReactElement } from 'react'
import { useOutcomes } from '../hooks/useOutcomes'
import { useDepartments } from '../hooks/useDepartments'
import OutcomeCard from '../components/outcomes/OutcomeCard'
import OutcomeDetail from '../components/outcomes/OutcomeDetail'
import AlertBanner from '../components/outcomes/AlertBanner'
import SkeletonCard from '../components/common/SkeletonCard'

const STATUS_FILTERS = [
  { value: 'all',      label: 'All'      },
  { value: 'active',   label: 'Active'   },
  { value: 'achieved', label: 'Achieved' },
  { value: 'at_risk',  label: 'At Risk'  },
  { value: 'inactive', label: 'Inactive' },
]

export default function Outcomes(): ReactElement {
  const {
    filteredList,
    grouped,
    selected,
    summary,
    alerts,
    loading,
    detailLoading,
    error,
    searchQuery,
    filterStatus,
    filterDept,
    getDeptName,
    getDeptColor,
    getProgress,
    loadById,
    clearDetail,
    search,
    filterByStatus,
    filterByDept,
    refetch,
  } = useOutcomes(true)

  const { departments } = useDepartments()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleCardClick = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null)
      clearDetail()
    } else {
      setSelectedId(id)
      loadById(id)
    }
  }

  const deptIds = Object.keys(grouped)

  return (
    <div className="animate-fade-slide">

      {/* ── Page Header ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
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
            Performance Tracking
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {filteredList.length} outcome{filteredList.length !== 1 ? 's' : ''} tracked
            {alerts.length > 0 && (
              <span style={{ color: 'var(--danger)', marginLeft: 8 }}>
                · {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
              </span>
            )}
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
        >
          <span style={{ fontSize: 14 }}>↻</span>
          REFRESH
        </button>
      </div>

      {/* ── Alert Banner ─────────────────────────────────── */}
      <AlertBanner alerts={alerts} />

      {/* ── Summary Stats ────────────────────────────────── */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Total',    value: summary.total_outcomes,   color: 'var(--cyan)'    },
            { label: 'Achieved', value: summary.achieved,          color: 'var(--success)' },
            { label: 'At Risk',  value: summary.at_risk,           color: 'var(--danger)'  },
            { label: 'Signals',  value: summary.total_signals,     color: 'var(--warning)' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  fontFamily: 'Rajdhani',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filters ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>

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
            placeholder="Search outcomes..."
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

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => filterByStatus(opt.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 7,
                border: `1px solid ${filterStatus === opt.value ? 'var(--cyan)' : 'var(--border)'}`,
                background: filterStatus === opt.value ? 'var(--cyan-glow)' : 'var(--bg-surface)',
                color: filterStatus === opt.value ? 'var(--cyan)' : 'var(--text-secondary)',
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

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            background: 'rgba(255,68,85,0.08)',
            border: '1px solid rgba(255,68,85,0.3)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: 'var(--danger)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚠</span> {error}
          <button
            onClick={refetch}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid var(--danger)',
              borderRadius: 4,
              color: 'var(--danger)',
              fontSize: 11,
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'Rajdhani',
              fontWeight: 600,
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* ── Main Layout ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selected ? 'minmax(0,1fr) 340px' : '1fr',
          gap: 20,
          alignItems: 'start',
          transition: 'grid-template-columns 0.3s ease',
        }}
      >
        {/* Outcome list */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : deptIds.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }}>◆</div>
              <div
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                No Outcomes Found
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Outcomes will seed automatically from your departments.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {deptIds.map((deptId) => {
                const deptOutcomes = grouped[deptId]
                const deptName    = getDeptName(deptId)
                const deptColor   = getDeptColor(deptId)

                return (
                  <div key={deptId}>
                    {/* Dept group header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 10,
                        paddingBottom: 8,
                        borderBottom: `1px solid ${deptColor}30`,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: deptColor,
                          boxShadow: `0 0 8px ${deptColor}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'Rajdhani',
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: '0.15em',
                          color: deptColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {deptName}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          fontFamily: 'Rajdhani',
                          fontWeight: 600,
                        }}
                      >
                        {deptOutcomes.length} outcome{deptOutcomes.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: selected
                          ? '1fr'
                          : 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 8,
                        transition: 'grid-template-columns 0.3s ease',
                      }}
                    >
                      {deptOutcomes.map((outcome) => (
                        <OutcomeCard
                          key={outcome.id}
                          outcome={outcome}
                          deptColor={deptColor}
                          progress={getProgress(outcome)}
                          onClick={handleCardClick}
                          isSelected={selectedId === outcome.id}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ position: 'sticky', top: 84 }}>
            <OutcomeDetail
              detail={selected}
              deptColor={getDeptColor(selected.outcome.department_id)}
              progress={getProgress(selected.outcome)}
              onClose={() => {
                setSelectedId(null)
                clearDetail()
              }}
              loading={detailLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}