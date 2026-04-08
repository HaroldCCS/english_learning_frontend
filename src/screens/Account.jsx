import { useEffect, useState } from 'react'
import * as api from '../lib/api'
import { clearToken } from '../lib/auth'
import Shell from '../components/Shell'

export default function Account({ token, onLogout }) {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api
      .me(token)
      .then((res) => {
        if (!mounted) return
        setUserId(res.userId || '')
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message || 'Failed')
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Shell
      title="Account"
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
          onClick={() => {
            clearToken()
            onLogout()
          }}
        >
          Logout
        </button>
      }
    >
      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-xs text-zinc-400">User ID</div>
        <div className="mt-1 break-all text-sm text-zinc-100">{userId || '—'}</div>
      </div>
    </Shell>
  )
}
