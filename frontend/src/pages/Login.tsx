import { useState, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser } from '../store/authSlice'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function Login(): ReactElement {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(loginUser(data))
    if (loginUser.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dde8f4 0%, #e8eef8 40%, #d8e4f0 70%, #e2ecf6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[
          { top: '-80px', left: '-100px',  size: 500, color: 'rgba(90,169,196,0.18)' },
          { top: '60%',   right: '-80px',  size: 420, color: 'rgba(126,200,227,0.14)' },
          { bottom: '-60px', left: '30%',  size: 380, color: 'rgba(74,148,173,0.12)' },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute',
            width:  o.size,
            height: o.size,
            borderRadius: '50%',
            background: o.color,
            filter: 'blur(60px)',
            top:    o.top,
            left:   o.left,
            right:  (o as { right?: string }).right,
            bottom: (o as { bottom?: string }).bottom,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--neu-bg, #e6ecf3)',
            boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
          }}>
            ◈
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#e6ecf3',
          borderRadius: 28,
          boxShadow: '10px 10px 28px #c3cdd8, -10px -10px 28px #ffffff',
          padding: '40px 36px',
        }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#1a2635',
              marginBottom: 6,
              letterSpacing: '-0.3px',
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13, color: '#8096aa' }}>
              Sign in to your AXIS workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <div style={{
                background: '#e6ecf3',
                borderRadius: 30,
                boxShadow: 'inset 6px 6px 14px #c3cdd8, inset -6px -6px 14px #ffffff',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 14, color: '#8096aa' }}>✉</span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
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
              </div>
              {errors.email && (
                <p style={{ fontSize: 11, color: '#b92c2c', marginTop: 4, paddingLeft: 12 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5e72', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <div style={{
                background: '#e6ecf3',
                borderRadius: 30,
                boxShadow: 'inset 6px 6px 14px #c3cdd8, inset -6px -6px 14px #ffffff',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 14, color: '#8096aa' }}>🔒</span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
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
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#8096aa',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 11, color: '#b92c2c', marginTop: 4, paddingLeft: 12 }}>
                  {errors.password.message}
                </p>
              )}
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
                marginTop: 8,
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
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8096aa' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#5aa9c4', fontWeight: 700, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#8096aa' }}>
          AXIS Central Intelligence System
        </p>
      </div>
    </div>
  )
}