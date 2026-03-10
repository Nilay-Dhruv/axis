import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  errorMsg: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message }
  }

  override componentDidCatch(error: Error): void {
    console.error('[AXIS ErrorBoundary]', error)
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          padding: 40,
        }}
      >
        <div
          style={{
            background: 'var(--neu-bg)',
            borderRadius: 24,
            boxShadow: 'var(--neu-shadow-out)',
            padding: '40px 48px',
            textAlign: 'center',
            maxWidth: 480,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--neu-bg)',
              boxShadow: 'var(--neu-shadow-out)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 20px',
            }}
          >
            ⚠
          </div>

          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'var(--neu-text-light)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {this.props.fallbackTitle ?? 'Module Error'}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--neu-text-dark)',
              marginBottom: 10,
            }}
          >
            Something went wrong
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--neu-text-light)',
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            This section encountered an unexpected error. Your data is safe —
            try refreshing the page.
          </div>

          {this.state.errorMsg && (
            <div
              style={{
                background: 'var(--neu-bg)',
                boxShadow: 'var(--neu-shadow-in)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 11,
                color: '#b44646',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: 20,
                wordBreak: 'break-word',
              }}
            >
              {this.state.errorMsg}
            </div>
          )}

          <button
            className="neu-btn-primary"
            onClick={() => window.location.reload()}
          >
            ↺ RELOAD PAGE
          </button>
        </div>
      </div>
    )
  }
}