import { useState, type ReactElement } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

// ─── Password helpers ─────────────────────────────────────────────────────────

function getPasswordStrength(password: string): number {
  let s = 0
  if (password.length >= 8)                       s++
  if (/[A-Z]/.test(password))                     s++
  if (/[a-z]/.test(password))                     s++
  if (/[0-9]/.test(password))                     s++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password))   s++
  return s
}

function validatePassword(password: string): string | null {
  if (password.length < 8)                        return 'Password must be at least 8 characters long'
  if (!/[A-Z]/.test(password))                    return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password))                    return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password))                    return 'Password must contain at least one digit'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))  return 'Password must contain at least one special character'
  return null
}

const strengthColors = ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60', '#27ae60']
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

// ─── Shared styles (exact from reference) ────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  borderRadius: 50,
  background: '#e6ecf3',
  boxShadow: 'inset 6px 6px 12px #c3c9d1, inset -6px -6px 12px #ffffff',
  padding: '0 22px',
  height: 50,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: 14,
  color: '#374151',
  fontFamily: 'inherit',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Register(): ReactElement {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
  })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const passwordStrength = getPasswordStrength(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim())  return setError('Name is required')
    if (!formData.email.trim()) return setError('Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                return setError('Please enter a valid email address')
    const passwordError = validatePassword(formData.password)
    if (passwordError)          return setError(passwordError)
    if (formData.password !== formData.confirmPassword)
                                return setError('Passwords do not match')

    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
      })

      // Optionally trigger verification email
      if (response.data.user?.id) {
        await api.post('/auth/send-verification-email', { user_id: response.data.user.id })
          .catch(() => {/* optional */})
      }

      navigate('/login', {
        state: {
          registered:  true,
          email:       formData.email,
          isFirstUser: response.data.role === 'admin',
        },
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword
  const passwordsDiff  = formData.confirmPassword && formData.password !== formData.confirmPassword

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'linear-gradient(135deg, #dce8f5 0%, #e8f0f8 40%, #d0e4f0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Ambient blobs — identical to login page ─────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80,  left: -80,  width: 500, height: 500, background: 'rgba(147,197,253,0.30)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top:  40,  right: -80, width: 500, height: 500, background: 'rgba(165,180,252,0.25)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '33%',width: 500, height: 500, background: 'rgba(103,232,249,0.20)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      {/* ── Card ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '490px',
          maxWidth: 460,
          background: '#e6ecf3',
          borderRadius: 28,
          boxShadow: '8px 8px 24px #c3c9d1, -8px -8px 24px #ffffff',
          padding: '40px 36px 36px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '4px 4px 10px #c3c9d1, -4px -4px 10px #ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img src="/logo.jpeg" alt="AXIS" style={{ width: 58, height: 58, objectFit: 'contain' }} />
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1e2d3d', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            AXIS
          </h2>
          <p style={{ fontSize: 13.5, color: '#8a96a3', margin: 0 }}>Create your account</p>
        </div>

        {/* First-user info note */}
        <div
          style={{
            background: 'rgba(90,169,196,0.10)',
            border: '1px solid rgba(90,169,196,0.25)',
            borderRadius: 14,
            padding: '9px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: '#3a7d96',
            lineHeight: 1.5,
          }}
        >
          ◈ <strong>First registered user becomes Admin.</strong> All others start as Staff — an admin can assign roles from User Management.
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#fdecea',
              border: '1px solid #f5c6c6',
              borderRadius: 14,
              padding: '10px 16px',
              marginBottom: 16,
              fontSize: 12.5,
              color: '#c0392b',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Full Name */}
          <div style={fieldStyle}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              autoComplete="name"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={fieldStyle}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          {/* <div style={fieldStyle}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number (optional)"
              autoComplete="tel"
              style={inputStyle}
            />
          </div> */}

          {/* Password */}
          <div>
            <div style={fieldStyle}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8a96a3', fontSize: 11, fontWeight: 700,
                  padding: 0, flexShrink: 0, letterSpacing: '0.04em',
                }}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Strength meter */}
            {formData.password && (
              <div style={{ marginTop: 8, padding: '0 6px' }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : '#c3c9d1',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11, fontWeight: 600,
                    color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : '#9ca3af',
                  }}
                >
                  {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div style={fieldStyle}>
              <input
                type={showConf ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConf(p => !p)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8a96a3', fontSize: 11, fontWeight: 700,
                  padding: 0, flexShrink: 0, letterSpacing: '0.04em',
                }}
              >
                {showConf ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {passwordsDiff && (
              <p style={{ fontSize: 11, color: '#e74c3c', margin: '5px 0 0 6px' }}>⚠️ Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p style={{ fontSize: 11, color: '#27ae60', margin: '5px 0 0 6px' }}>✓ Passwords match</p>
            )}
          </div>

          {/* Password requirements checklist */}
          {formData.password && (
            <div
              style={{
                background: '#e6ecf3',
                boxShadow: 'inset 4px 4px 8px #c3c9d1, inset -4px -4px 8px #ffffff',
                borderRadius: 16,
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '5px 12px',
              }}
            >
              {[
                { test: formData.password.length >= 8,                         label: '8+ characters'    },
                { test: /[A-Z]/.test(formData.password),                       label: 'Uppercase letter'  },
                { test: /[a-z]/.test(formData.password),                       label: 'Lowercase letter'  },
                { test: /[0-9]/.test(formData.password),                       label: 'Number'            },
                { test: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),     label: 'Special character' },
              ].map(({ test, label }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 600,
                    color: test ? '#27ae60' : '#9ca3af',
                    transition: 'color 0.2s',
                  }}
                >
                  <span style={{ fontSize: 10 }}>{test ? '✓' : '○'}</span>
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button — identical pill style to Login */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 50,
              borderRadius: 50,
              border: 'none',
              background: '#5aa9c4',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '6px 6px 12px #c3c9d1, -6px -6px 12px #ffffff',
              transition: 'box-shadow 0.2s',
              marginTop: 6,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #4a94ad, inset -4px -4px 8px #6ec0db'
            }}
            onMouseLeave={e => {
              if (!loading) e.currentTarget.style.boxShadow = '6px 6px 12px #c3c9d1, -6px -6px 12px #ffffff'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Footer link — identical to Login's sign-up link */}
          <div style={{ textAlign: 'center', fontSize: 13.5, color: '#8a96a3', marginTop: 4 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#5aa9c4', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}