import { useEffect, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'

export default function Recent({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await api.recentVocab(token)
      setItems(Array.isArray(res) ? res : [])
    } catch (err) {
      setError(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Shell
      title="Recent"
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
          onClick={load}
          disabled={loading}
        >
          Reload
        </button>
      }
    >
      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-400">No vocab yet.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{it.english}</div>
                <div className="text-xs text-zinc-400">Box {it.box}</div>
              </div>
              <div className="text-zinc-300">{it.spanish}</div>
              {it.category ? <div className="mt-1 text-xs text-zinc-400">{it.category}</div> : null}
            </div>
          ))
        )}
      </div>
    </Shell>
  )
}
