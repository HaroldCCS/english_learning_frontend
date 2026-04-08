import { useMemo, useState } from 'react'
import * as api from '../lib/api'
import { setToken } from '../lib/auth'

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (mode === 'login' ? 'Sign in' : 'Create account'), [mode])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? api.login : api.register
      const res = await fn(email.trim(), password)
      setToken(res.token)
      onAuthed(res.token)
    } catch (err) {
      setError(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${mode === 'login' ? 'bg-zinc-800' : 'text-zinc-300'}`}
            onClick={() => setMode('login')}
            disabled={loading}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${mode === 'register' ? 'bg-zinc-800' : 'text-zinc-300'}`}
            onClick={() => setMode('register')}
            disabled={loading}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Email</label>
          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Password</label>
          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            disabled={loading}
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div className="text-xs text-zinc-400">
          JWT is saved locally to avoid re-logins.
        </div>
      </form>
    </div>
  )
}
