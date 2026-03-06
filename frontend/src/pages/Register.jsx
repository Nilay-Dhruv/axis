import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    organization_name: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // API call wired up on Day 3
    setLoading(false)
  }

  const fields = [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com' },
    { name: 'organization_name', label: 'Organization Name', type: 'text', placeholder: 'My Company (optional)' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 chars, 1 uppercase, 1 number' },
  ]

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.name !== 'organization_name'}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                {errors[field.name] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition-all duration-200 mt-2"
            >
              {loading ? 'Creating workspace...' : 'Create workspace'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}