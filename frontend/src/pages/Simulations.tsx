import { useState, type ReactElement } from 'react'

interface SimDemoProps {
  label:    string
  baseline: number
  simmed:   number
  unit:     string
}

function SimBar({ label, baseline, simmed, unit }: SimDemoProps): ReactElement {
  const max = Math.max(baseline, simmed, 100)
  const bp  = (baseline / max) * 100
  const sp  = (simmed   / max) * 100
  const diff = simmed - baseline
  const pct  = baseline > 0 ? Math.round((diff / baseline) * 100) : 0

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neu-text-mid)' }}>{label}</span>
        <span
          style={{
            fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
            color: diff >= 0 ? '#468c64' : '#b44646',
            background: diff >= 0 ? 'rgba(70,140,100,0.10)' : 'rgba(180,70,70,0.10)',
            padding: '2px 8px', borderRadius: 20,
          }}
        >
          {diff >= 0 ? '+' : ''}{pct}%
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--neu-text-light)', width: 60, textAlign: 'right', flexShrink: 0, fontFamily: 'Rajdhani', fontWeight: 600 }}>
            BASELINE
          </span>
          <div style={{ flex: 1, background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${bp}%`, height: '100%', background: '#8096aa', borderRadius: 4, transition: 'width 0.6s' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--neu-text-mid)', width: 50, flexShrink: 0, fontFamily: 'Rajdhani', fontWeight: 700 }}>
            {baseline}{unit}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--neu-accent)', width: 60, textAlign: 'right', flexShrink: 0, fontFamily: 'Rajdhani', fontWeight: 600 }}>
            SIMULATED
          </span>
          <div style={{ flex: 1, background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${sp}%`, height: '100%', background: 'var(--neu-accent)', borderRadius: 4, transition: 'width 0.6s' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--neu-accent)', width: 50, flexShrink: 0, fontFamily: 'Rajdhani', fontWeight: 700 }}>
            {simmed}{unit}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Simulations(): ReactElement {
  const [sliderValue, setSliderValue] = useState(20)

  // Toy model: adjusting headcount slider changes simulated values
  const simRevenue  = Math.round(850 + sliderValue * 2.4)
  const simCost     = Math.round(320 + sliderValue * 4.1)
  const simCapacity = Math.round(60  + sliderValue * 0.9)

  return (
    <div className="neu-fade-up" style={{ maxWidth: 860, margin: '0 auto' }}>

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
            position: 'absolute', top: -50, left: -50,
            width: 240, height: 240, borderRadius: '50%',
            background: 'rgba(90,169,196,0.08)',
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
          ◑
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
          Scenario Simulations
        </h1>
        <p style={{ fontSize: 14, color: 'var(--neu-text-mid)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
          Model "what if" scenarios against your real outcomes and signals before committing
          resources. See the projected impact of every decision before you make it.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="neu-btn-primary"
            style={{ minWidth: 160 }}
          >
            ◆ UPGRADE PLAN
          </button>
          <button className="neu-btn-ghost">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Interactive demo */}
      <div
        style={{
          background: 'var(--neu-bg)',
          borderRadius: 20,
          boxShadow: 'var(--neu-shadow-out)',
          padding: '28px 32px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div
              style={{
                fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.15em', color: 'var(--neu-text-light)',
                textTransform: 'uppercase', marginBottom: 4,
              }}
            >
              Interactive Preview
            </div>
            <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
              Adjust team size to see projected outcome impact
            </div>
          </div>
          <span
            style={{
              fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
              letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 20,
              background: 'rgba(90,169,196,0.10)', color: 'var(--neu-accent)',
              border: '1px solid rgba(90,169,196,0.2)',
            }}
          >
            DEMO MODE
          </span>
        </div>

        {/* Slider control */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <label
              style={{
                fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
                letterSpacing: '0.12em', color: 'var(--neu-text-mid)', textTransform: 'uppercase',
              }}
            >
              Headcount Increase
            </label>
            <span style={{ fontSize: 15, fontFamily: 'Rajdhani', fontWeight: 800, color: 'var(--neu-accent)' }}>
              +{sliderValue} FTEs
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            style={{
              width: '100%',
              appearance: 'none',
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(90deg, var(--neu-accent) ${sliderValue * 2}%, #d4e0ec ${sliderValue * 2}%)`,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--neu-text-light)', fontFamily: 'Rajdhani', fontWeight: 600 }}>0 FTEs</span>
            <span style={{ fontSize: 10, color: 'var(--neu-text-light)', fontFamily: 'Rajdhani', fontWeight: 600 }}>+50 FTEs</span>
          </div>
        </div>

        {/* Sim bars */}
        <SimBar label="Revenue ($k)"      baseline={850} simmed={simRevenue}  unit="k" />
        <SimBar label="Operating Cost ($k)" baseline={320} simmed={simCost}  unit="k" />
        <SimBar label="Team Capacity (%)"  baseline={60}  simmed={Math.min(simCapacity, 100)} unit="%" />

        <div
          style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(90,169,196,0.07)',
            border: '1px solid rgba(90,169,196,0.2)',
            fontSize: 11, color: 'var(--neu-text-light)', lineHeight: 1.6,
          }}
        >
          ◈ This is a static demo. Full simulations use your live outcome data, historical signal patterns, and configurable assumption sets.
        </div>
      </div>

      {/* Capabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { icon: '📐', title: 'Assumption Sets',        desc: 'Define named sets of variables (growth rate, cost per hire, churn) and swap them instantly.'  },
          { icon: '📈', title: 'Outcome Projection',     desc: 'See how simulated changes cascade through your linked outcomes and signals.'                   },
          { icon: '🔀', title: 'Scenario Comparison',    desc: 'Run up to 5 scenarios side-by-side. Pin your preferred path and share with stakeholders.'      },
          { icon: '💾', title: 'Saved Simulations',      desc: 'Store snapshots of past simulations to track how assumptions have evolved over time.'           },
        ].map((cap) => (
          <div
            key={cap.title}
            style={{
              background: 'var(--neu-bg)',
              borderRadius: 16,
              boxShadow: 'var(--neu-shadow-out)',
              padding: '20px 22px',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 10 }}>{cap.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--neu-text-dark)', marginBottom: 6 }}>{cap.title}</div>
            <div style={{ fontSize: 11, color: 'var(--neu-text-light)', lineHeight: 1.7 }}>{cap.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}