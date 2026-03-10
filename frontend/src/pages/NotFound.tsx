import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound(): ReactElement {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dde8f4 0%, #e8eef8 40%, #d8e4f0 70%, #e2ecf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: '#e6ecf3',
          borderRadius: 28,
          boxShadow: '10px 10px 28px #c3cdd8, -10px -10px 28px #ffffff',
          padding: '56px 48px',
          maxWidth: 460,
          textAlign: 'center',
        }}
      >
        {/* Big 404 */}
        <div
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '2px #c3cdd8',
            marginBottom: 8,
            letterSpacing: '-4px',
          }}
        >
          404
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(90,169,196,0.10)',
            border: '1px solid rgba(90,169,196,0.25)',
            borderRadius: 30,
            padding: '4px 14px',
            fontSize: 10,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#5aa9c4',
            marginBottom: 20,
          }}
        >
          ◆ PAGE NOT FOUND
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#1a2635',
            marginBottom: 10,
          }}
        >
          This route doesn't exist
        </div>

        <div
          style={{
            fontSize: 13,
            color: '#8096aa',
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          The page you're looking for isn't part of AXIS — or it may have moved.
          Head back to the dashboard to continue.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="neu-btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ minWidth: 160 }}
          >
            ◈ GO TO DASHBOARD
          </button>
          <button
            className="neu-btn-ghost"
            onClick={() => navigate(-1)}
          >
            ← GO BACK
          </button>
        </div>
      </div>
    </div>
  )
}