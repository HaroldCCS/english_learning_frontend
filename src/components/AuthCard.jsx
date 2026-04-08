import { useMemo, useState } from 'react'
import * as api from '../lib/api'
import { setToken } from '../lib/auth'

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (mode === 'login' ? 'Entrar' : 'Crear cuenta'), [mode])

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
      setError(err?.message || 'No se pudo completar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${mode === 'login' ? 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}
            onClick={() => setMode('login')}
            disabled={loading}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${
              mode === 'register'
                ? 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
            onClick={() => setMode('register')}
            disabled={loading}
          >
            Crear
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Email</label>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Contraseña</label>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            disabled={loading}
          />
          <div className="mt-2 text-xs text-zinc-400">Tip: usa una contraseña segura y guárdala en un lugar seguro.</div>
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? '...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <div className="text-xs text-zinc-400">
          Guardamos tu sesión en este dispositivo para evitar que tengas que entrar cada vez.
        </div>
      </form>
    </div>
  )
}
