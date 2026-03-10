import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

interface StepProps {
  number: string
  title:  string
  desc:   string
}

function DecisionStep({ number, title, desc }: StepProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex', gap: 18, alignItems: 'flex-start',
        padding: '20px 0',
        borderBottom: '1px solid var(--neu-divider)',
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'var(--neu-bg)',
          boxShadow: 'var(--neu-shadow-out)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Rajdhani', fontWeight: 800, fontSize: 16,
          color: 'var(--neu-accent)',
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--neu-text-dark)', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--neu-text-light)', lineHeight: 1.7 }}>
          {desc}
        </div>
      </div>
    </div>
  )
}

export default function Decisions(): ReactElement {
  const navigate = useNavigate()

  return (
    <div className="neu-fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Hero */}
      <div
        style={{
          background: 'var(--neu-bg)',
          borderRadius: 24,
          boxShadow: 'var(--neu-shadow-out)',
          padding: '48px 40px',
          marginBottom: 28,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(126,200,227,0.10)',
            filter: 'blur(35px)', pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--neu-bg)',
            boxShadow: 'var(--neu-shadow-out)',
            fontSize: 32, marginBottom: 20,
          }}
        >
          ◐
        </div>

        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(90,169,196,0.10)',
            border: '1px solid rgba(90,169,196,0.3)',
            borderRadius: 30, padding: '4px 14px',
            fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
            letterSpacing: '0.15em', color: 'var(--neu-accent)',
            marginBottom: 16,
          }}
        >
          ◆ COMING SOON — PREMIUM
        </div>

        <h1
          style={{
            fontSize: 30, fontWeight: 900, color: 'var(--neu-text-dark)',
            letterSpacing: '-0.3px', marginBottom: 12,
          }}
        >
          Decision Intelligence
        </h1>
        <p style={{ fontSize: 14, color: 'var(--neu-text-mid)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
          Frame complex decisions, gather structured input from stakeholders, and
          use live data from your outcomes and signals to pick the best path forward.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="neu-btn-primary"
            onClick={() => navigate('/settings')}
            style={{ minWidth: 160 }}
          >
            ◆ UPGRADE PLAN
          </button>
          <button className="neu-btn-ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* How it works */}
      <div
        style={{
          background: 'var(--neu-bg)',
          borderRadius: 20,
          boxShadow: 'var(--neu-shadow-out)',
          padding: '28px 32px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.15em', color: 'var(--neu-text-light)',
            textTransform: 'uppercase', marginBottom: 4,
          }}
        >
          How It Works
        </div>
        <div style={{ fontSize: 13, color: 'var(--neu-text-mid)', marginBottom: 20 }}>
          A structured 5-step decision framework, powered by your live data
        </div>

        <DecisionStep
          number="01"
          title="Frame the Decision"
          desc="Define the question, the stakeholders involved, the deadline, and the criteria that matter most."
        />
        <DecisionStep
          number="02"
          title="Pull Live Context"
          desc="AXIS automatically surfaces relevant outcomes, signal states, and recent activity logs tied to the decision domain."
        />
        <DecisionStep
          number="03"
          title="Gather Input"
          desc="Invite team members to weigh in asynchronously. Each person scores options against defined criteria with optional reasoning."
        />
        <DecisionStep
          number="04"
          title="Score & Rank"
          desc="The engine aggregates weighted scores, surfaces consensus, flags outliers, and ranks options by composite fit."
        />
        <DecisionStep
          number="05"
          title="Commit & Track"
          desc="Once a decision is committed, AXIS creates linked activities and tracks outcomes — closing the loop automatically."
        />
      </div>

      {/* Use cases */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        }}
      >
        {[
          { icon: '💰', label: 'Budget Allocation',    desc: 'Compare ROI across departments' },
          { icon: '🧑‍🤝‍🧑', label: 'Hiring Decisions',   desc: 'Score candidates against criteria' },
          { icon: '🚀', label: 'Product Priorities',   desc: 'Rank features by strategic fit'   },
          { icon: '⚖️', label: 'Risk Trade-offs',      desc: 'Weigh options against signals'    },
        ].map((uc) => (
          <div
            key={uc.label}
            style={{
              background: 'var(--neu-bg)',
              borderRadius: 14,
              boxShadow: 'var(--neu-shadow-out)',
              padding: '18px 20px',
              display: 'flex', gap: 12, alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 24 }}>{uc.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--neu-text-dark)' }}>{uc.label}</div>
              <div style={{ fontSize: 11, color: 'var(--neu-text-light)', marginTop: 2 }}>{uc.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}