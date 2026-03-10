import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

interface FeatureCardProps {
  icon:        string
  title:       string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps): ReactElement {
  return (
    <div
      style={{
        background: 'var(--neu-bg)',
        borderRadius: 16,
        boxShadow: 'var(--neu-shadow-out)',
        padding: '22px 24px',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'var(--neu-bg)',
          boxShadow: 'var(--neu-shadow-out)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'var(--neu-accent)',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neu-text-dark)', marginBottom: 5 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--neu-text-light)', lineHeight: 1.7 }}>
          {description}
        </div>
      </div>
    </div>
  )
}

export default function Automations(): ReactElement {
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
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 260, height: 260, borderRadius: '50%',
            background: 'rgba(90,169,196,0.10)',
            filter: 'blur(40px)', pointerEvents: 'none',
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
          ⚙
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
          Intelligent Automations
        </h1>
        <p style={{ fontSize: 14, color: 'var(--neu-text-mid)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
          Define trigger-based workflows that respond to signals, outcomes, and activity thresholds —
          automatically, in real time, without manual intervention.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="neu-btn-primary"
            onClick={() => navigate('/settings')}
            style={{ minWidth: 160 }}
          >
            ◆ UPGRADE PLAN
          </button>
          <button
            className="neu-btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Feature preview */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.15em', color: 'var(--neu-text-light)',
            textTransform: 'uppercase', marginBottom: 16,
          }}
        >
          What's Included
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeatureCard
            icon="⚡"
            title="Signal-Triggered Actions"
            description="Automatically execute activities or send alerts when a signal crosses a threshold — critical warnings become instant workflows."
          />
          <FeatureCard
            icon="🔁"
            title="Scheduled Workflows"
            description="Set recurring tasks by time interval or calendar event. Weekly reports, monthly audits, and daily syncs — all on autopilot."
          />
          <FeatureCard
            icon="🔗"
            title="Cross-Department Chains"
            description="Connect activities across departments. When Finance completes a budget review, trigger a cascade of Operations and HR tasks automatically."
          />
          <FeatureCard
            icon="📊"
            title="Outcome-Based Rules"
            description="Adjust team priorities automatically when outcome progress drops below a threshold. Keep teams focused on what matters most."
          />
          <FeatureCard
            icon="📣"
            title="Smart Notifications"
            description="Route the right alert to the right person. Escalate critical signals to managers, route warnings to owners, and summarize normal status in digests."
          />
        </div>
      </div>
    </div>
  )
}