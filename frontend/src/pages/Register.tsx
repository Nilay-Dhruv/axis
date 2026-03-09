import { useState, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUser } from '../store/authSlice'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Invalid email address'),
  password:  z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need one uppercase letter')
    .regex(/[0-9]/, 'Need one number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

function NeuInput({
  icon, placeholder, type = 'text', error,
  registration, rightEl,
}: {
  icon: string
  placeholder: string
  type?: string
  error?: string
  registration: ReturnType<ReturnType<typeof useForm<FormData>>['register']>
  rightEl?: ReactElement
}): ReactElement {
  return (
    <div>
      <div style={{
        background: '#e6ecf3',
        borderRadius: 30,
        boxShadow: 'inset 6px 6px 14px #c3cdd8, inset -6px -6px 14px #ffffff',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 14, color: '#8096aa', flexShrink: 0 }}>{icon}</span>
        <input
          {...registration}
          type={type}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#1a2635',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
        {rightEl}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: '#b92c2c', marginTop: 4, paddingLeft: 12 }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function Register(): ReactElement {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const { loading, error, registrationSuccess } = useAppSelector((s) => s.auth)
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await dispatch(registerUser({
      full_name: data.full_name,
      email:     data.email,
      password:  data.password,
    }))
  }

  if (registrationSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dde8f4 0%, #e8eef8 40%, #d8e4f0 70%, #e2ecf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          background: '#e6ecf3',
          borderRadius: 28,
          boxShadow: '10px 10px 28px #c3cdd8, -10px -10px 28px #ffffff',
          padding: '48px 40px',
          maxWidth: 400,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2635', marginBottom: 8 }}>
            Account Created!
          </h2>
          <p style={{ fontSize: 13, color: '#8096aa', marginBottom: 28, lineHeight: 1.6 }}>
            Your AXIS workspace is ready. Sign in to get started.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#5aa9c4',
              color: 'white',
              border: 'none',
              borderRadius: 30,
              padding: '12px 32px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Sign In →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dde8f4 0%, #e8eef8 40%, #d8e4f0 70%, #e2ecf6 100%)',
      display: 'flex',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Left branding panel */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(145deg, #4a94ad 0%, #5aa9c4 50%, #7ec8e3 100%)',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="hidden-mobile"
      >
        {/* Decorative circles */}
        {[
          { size: 320, top: '-80px', right: '-80px', opacity: 0.12 },
          { size: 200, bottom: '10%', left: '-60px',  opacity: 0.1  },
          { size: 140, top: '42%',   right: '8%',    opacity: 0.08 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: c.size, height: c.size,
            borderRadius: '50%',
            background: 'white',
            opacity: c.opacity,
            top:    c.top,
            right:  (c as { right?: string }).right,
            bottom: (c as { bottom?: string }).bottom,
            left:   (c as { left?: string }).left,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 24, color: 'white' }}>◈</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>
              AXIS
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.8px' }}>
            CENTRAL INTELLIGENCE SYSTEM
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.25,
            marginBottom: 16,
            letterSpacing: '-0.3px',
          }}>
            Centralize your<br />operations.<br />Amplify your outcomes.
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 280 }}>
            One command center for departments, activities, signals, and decisions.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
            {['Departments', 'Outcomes', 'Signals', 'Analytics', 'Roles'].map((f) => (
              <span key={f} style={{
                background: 'rgba(255,255,255,0.18)',
                color: 'white',
                borderRadius: 30,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          © 2026 AXIS. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: '#e6ecf3',
              boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#5aa9c4',
            }}>
              ◈
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: '#e6ecf3',
            borderRadius: 28,
            boxShadow: '10px 10px 28px #c3cdd8, -10px -10px 28px #ffffff',
            padding: '36px 32px',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2635', marginBottom: 4 }}>
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: '#8096aa', marginBottom: 28 }}>
              Get started with AXIS in seconds
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Full name */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Full Name
                </label>
                <NeuInput
                  icon="👤"
                  placeholder="John Smith"
                  registration={register('full_name')}
                  error={errors.full_name?.message}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Email
                </label>
                <NeuInput
                  icon="✉"
                  placeholder="you@company.com"
                  type="email"
                  registration={register('email')}
                  error={errors.email?.message}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Password
                </label>
                <NeuInput
                  icon="🔒"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  type={showPass ? 'text' : 'password'}
                  registration={register('password')}
                  error={errors.password?.message}
                  rightEl={
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8096aa', padding: 0 }}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  }
                />
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Confirm Password
                </label>
                <NeuInput
                  icon="🔒"
                  placeholder="Repeat password"
                  type={showConfirm ? 'text' : 'password'}
                  registration={register('confirm')}
                  error={errors.confirm?.message}
                  rightEl={
                    <button type="button" onClick={() => setShowConfirm((p) => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8096aa', padding: 0 }}>
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  }
                />
              </div>

              {/* API error */}
              {error && (
                <div style={{
                  background: '#fdeaea',
                  border: '1px solid #f5c6c6',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#b92c2c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  background: loading ? '#8096aa' : '#5aa9c4',
                  color: 'white',
                  border: 'none',
                  borderRadius: 30,
                  padding: '14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: loading
                    ? 'none'
                    : '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'neu-spin 0.75s linear infinite',
                    }} />
                    Creating account...
                  </>
                ) : 'Create Account →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8096aa' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#5aa9c4', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}