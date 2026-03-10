import { useState, type ReactElement } from 'react'
import { useDepartments } from '../hooks/useDepartments'
// import DepartmentCard from '../components/departments/DepartmentCard'
import DepartmentDetail from '../components/departments/DepartmentDetail'
// import SkeletonCard from '../components/common/SkeletonCard'

const FILTER_OPTIONS = [
  { value: 'all',         label: 'All' },
  { value: 'leadership',  label: 'Leadership' },
  { value: 'finance',     label: 'Finance' },
  { value: 'sales',       label: 'Sales' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'operations',  label: 'Operations' },
  { value: 'hr',          label: 'HR' },
]

export default function Departments(): ReactElement {
  const {
    departments,
    selected,
    loading,
    detailLoading,
    error,
    searchQuery,
    filterType,
    search,
    filter,
    clearDetail,
    refetch,
  } = useDepartments()

  const [, setSelectedId] = useState<string | null>(null)


  const handleClose = () => {
    setSelectedId(null)
    clearDetail()
  }

  return (
    <div className="animate-fade-slide">

      {/* ── Page Header ───────────────────────────────────── */}
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
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Organization Structure
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {departments.length} department{departments.length !== 1 ? 's' : ''} active
            {searchQuery && ` · filtered by "${searchQuery}"`}
          </div>
        </div>

        <button
          onClick={() => refetch()}
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

      {/* ── Search + Filter Bar ───────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
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
            placeholder="Search departments..."
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

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => filter(opt.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 7,
                border: `1px solid ${filterType === opt.value ? 'var(--cyan)' : 'var(--border)'}`,
                background: filterType === opt.value ? 'var(--cyan-glow)' : 'var(--bg-surface)',
                color: filterType === opt.value ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: 12,
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

      {/* ── Error State ───────────────────────────────────── */}
      {error && (
        <div
          style={{
            background: 'rgba(255, 68, 85, 0.08)',
            border: '1px solid rgba(255, 68, 85, 0.3)',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--danger)',
            fontSize: 13,
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
          <button
            onClick={() => refetch()}
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

      {/* ── Main Layout: Grid + Detail Panel ─────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selected ? 'minmax(0,1fr) 360px' : '1fr',
          gap: 20,
          alignItems: 'start',
          transition: 'grid-template-columns 0.3s ease',
        }}
      >

        {/* Department Grid */}
        <div>
          {loading && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 18,
                }}>
                  {[1, 2, 3, 4, 5, 6].map((k) => (
                    <div
                      key={k}
                      style={{
                        background: 'var(--neu-bg)',
                        borderRadius: 20,
                        boxShadow: 'var(--neu-shadow-out)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                          animation: 'pulse 1.4s ease-in-out infinite',
                        }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                          <div style={{
                            height: 14, width: '60%', borderRadius: 6,
                            background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                            animation: 'pulse 1.4s ease-in-out infinite',
                          }} />
                          <div style={{
                            height: 10, width: '40%', borderRadius: 6,
                            background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                            animation: 'pulse 1.4s ease-in-out infinite',
                          }} />
                        </div>
                      </div>
                      <div style={{
                        height: 10, width: '100%', borderRadius: 5,
                        background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }} />
                      <div style={{
                        height: 10, width: '75%', borderRadius: 5,
                        background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }} />
                    </div>
                  ))}
                </div>
              )}
                      </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ position: 'sticky', top: 84 }}>
            <DepartmentDetail
              detail={selected}
              onClose={handleClose}
              loading={detailLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}