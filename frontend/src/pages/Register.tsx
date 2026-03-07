import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth.ts'
import type { RegisterPayload } from '../types/auth'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  organization_name: z.string().min(2, 'Min 2 characters').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface FormField {
  name: keyof RegisterFormData
  label: string
  type: string
  placeholder: string
}

const fields: FormField[] = [
  { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com' },
  { name: 'organization_name', label: 'Organization Name (optional)', type: 'text', placeholder: 'My Company' },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 chars, 1 uppercase, 1 number' },
]

export default function Register() {
  const { register: registerUser, loading, error, fieldErrors, registrationSuccess, clearErrors } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => { return () => clearErrors() }, [])

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    const payload: RegisterPayload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      ...(data.organization_name ? { organization_name: data.organization_name } : {}),
    }
    await registerUser(payload)
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400">Redirecting you to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">
            AX<span className="text-indigo-500">IS</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Central Intelligence System</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Create your workspace</h2>
          <p className="text-slate-400 text-sm mb-8">Get started with AXIS today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {fields.map((field) => {
              const formError = errors[field.name]
              const serverError = fieldErrors?.[field.name]
              const errorMessage = formError?.message ?? (serverError ? serverError[0] : undefined)

              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                  <input
                    {...register(field.name)}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`w-full bg-slate-800 border text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 transition ${errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  />
                  {errorMessage && <p className="text-red-400 text-xs mt-1">{errorMessage}</p>}
                </div>
              )
            })}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? 'Creating workspace...' : 'Create workspace'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}