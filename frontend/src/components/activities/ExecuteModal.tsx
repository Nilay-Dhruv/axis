import { useState, useEffect, type ReactElement } from 'react'
import type { Activity } from '../../types/department'
import ActivityTypeBadge from './ActivityTypeBadge'

interface Props {
  activity: Activity
  onConfirm: (notes: string) => void
  onClose: () => void
  executing: boolean
  error: string | null
}

export default function ExecuteModal({
  activity,
  onConfirm,
  onClose,
  executing,
  error,
}: Props): ReactElement {
  const [notes, setNotes] = useState('')

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeSlideIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-bright)',
          borderTop: '2px solid var(--cyan)',
          borderRadius: 12,
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                letterSpacing: '0.2em',
                marginBottom: 6,
              }}
            >
              CONFIRM EXECUTION
            </div>
            <div
              style={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '0.04em',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {activity.name}
            </div>
            <ActivityTypeBadge type={activity.type} size="md" />
          </div>

          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              border: '1px solid var(--border)',
              background: 'transparent',
              borderRadius: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          {activity.description && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 18,
                padding: '10px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
              }}
            >
              {activity.description}
            </div>
          )}

          {/* Notes input */}
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}
          >
            EXECUTION NOTES
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
              (optional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this execution..."
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 7,
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: 13,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--cyan)' }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border)' }}
          />

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(255,68,85,0.08)',
                border: '1px solid rgba(255,68,85,0.3)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⚠</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            disabled={executing}
            style={{
              flex: 1,
              padding: '9px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 7,
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.1em',
              transition: 'all 0.15s',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() => onConfirm(notes)}
            disabled={executing}
            style={{
              flex: 2,
              padding: '9px',
              background: executing ? 'var(--border)' : 'var(--cyan-glow)',
              border: `1px solid ${executing ? 'var(--border)' : 'var(--cyan)'}`,
              borderRadius: 7,
              color: executing ? 'var(--text-muted)' : 'var(--cyan)',
              fontSize: 12,
              cursor: executing ? 'not-allowed' : 'pointer',
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.1em',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {executing ? (
              <>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid var(--border)',
                    borderTop: '2px solid var(--cyan)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                EXECUTING...
              </>
            ) : (
              <>▶ EXECUTE</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}