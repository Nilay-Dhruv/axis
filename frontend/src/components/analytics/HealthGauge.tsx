import type { ReactElement } from 'react'

interface Props {
  score: number
}

function getScoreConfig(score: number): { color: string; label: string; ring: string } {
  if (score >= 80) return { color: 'var(--success)', label: 'EXCELLENT', ring: 'var(--success)' }
  if (score >= 60) return { color: 'var(--cyan)',    label: 'GOOD',      ring: 'var(--cyan)'    }
  if (score >= 40) return { color: 'var(--warning)', label: 'FAIR',      ring: 'var(--warning)' }
  return             { color: 'var(--danger)',  label: 'CRITICAL', ring: 'var(--danger)'  }
}

export default function HealthGauge({ score }: Props): ReactElement {
  const cfg         = getScoreConfig(score)
  const radius      = 54
  const stroke      = 8
  const circumference = 2 * Math.PI * radius
  // Use 75% of circle (270 deg arc) for the gauge
  const arcLength   = circumference * 0.75
  const filled      = arcLength * (score / 100)
  const offset      = circumference * 0.125  // start at 135deg (bottom-left)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 8,
      }}
    >
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          style={{ transform: 'rotate(135deg)' }}
        >
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={cfg.ring}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${cfg.ring})`,
              transition: 'stroke-dasharray 0.8s ease',
            }}
          />
        </svg>

        {/* Center value */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              color: cfg.color,
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div
            style={{
              fontSize: 9,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
            }}
          >
            / 100
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: cfg.color,
          textTransform: 'uppercase',
        }}
      >
        {cfg.label}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Org Health Score
      </div>
    </div>
  )
}