import { useAuth } from '../hooks/useAuth.ts'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight">AX<span className="text-indigo-500">IS</span></h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user?.full_name}</span>
          <button
            onClick={logout}
            disabled={loading}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.full_name?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-400">Authentication complete. Dashboard coming on Day 5.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Day 3 Complete ✅
          </div>
        </div>
      </main>
    </div>
  )
}