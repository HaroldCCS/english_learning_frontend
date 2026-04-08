import { useEffect, useState } from 'react'
import * as api from '../lib/api'
import { clearToken } from '../lib/auth'
import Shell from '../components/Shell'

export default function Account({ token, onLogout }) {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

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
        setError(err?.message || 'No se pudo cargar tu cuenta')
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Shell
      title="Cuenta"
      subtitle="Tu sesión y datos básicos. Puedes copiar tu ID si necesitas soporte."
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          onClick={() => {
            clearToken()
            onLogout()
          }}
        >
          Salir
        </button>
      }
    >
      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}
      {toast ? (
        <div className="mb-3 rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">{toast}</div>
      ) : null}
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400">ID de usuario</div>
            <div className="mt-1 break-all text-sm text-zinc-900 dark:text-zinc-100">{userId || '—'}</div>
          </div>
          <button
            type="button"
            disabled={!userId}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(userId)
                setToast('ID copiado')
              } catch {
                setToast('No se pudo copiar')
              }
              setTimeout(() => setToast(''), 1200)
            }}
          >
            Copiar
          </button>
        </div>
        <div className="mt-2 text-xs text-zinc-400">Este ID identifica tu cuenta en el backend.</div>
      </div>
    </Shell>
  )
}
