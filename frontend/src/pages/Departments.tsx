import { useState, type ReactElement } from 'react'
import { useDepartments } from '../hooks/useDepartments'
import DepartmentCard from '../components/departments/DepartmentCard'
import DepartmentDetail from '../components/departments/DepartmentDetail'
import SkeletonCard from '../components/common/SkeletonCard'
import { useNavigate } from 'react-router-dom'

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

  // const handleCardClick = (id: string) => {
  //   if (selectedId === id) {
  //     setSelectedId(null)
  //     clearDetail()
  //   } else {
  //     setSelectedId(id)
  //     loadDepartment(id)
  //   }
  // }

  const handleClose = () => {
    setSelectedId(null)
    clearDetail()
  }
  const navigate = useNavigate();
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
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : departments.length === 0 ? (
            /* Empty state */
            <div
              style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◈</div>
              <div
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                No Departments Found
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'Departments will be seeded automatically.'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => search('')}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--cyan-glow)',
                    border: '1px solid var(--cyan)',
                    borderRadius: 6,
                    color: 'var(--cyan)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  CLEAR SEARCH
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: selected
                  ? 'repeat(auto-fill, minmax(240px, 1fr))'
                  : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
                transition: 'grid-template-columns 0.3s ease',
              }}
            >
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onClick={() => {
                    if (!dept.id) return;
                    navigate(`/departments/${dept.id}`);
                  }} isSelected={false} 
                />
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