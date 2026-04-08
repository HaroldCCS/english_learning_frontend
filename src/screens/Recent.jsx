import { useEffect, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'

export default function Recent({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [editing, setEditing] = useState(null)
  const [editEnglish, setEditEnglish] = useState('')
  const [editSpanish, setEditSpanish] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await api.recentVocab(token)
      setItems(Array.isArray(res) ? res : [])
    } catch (err) {
      setError(err?.message || 'No se pudo cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openEdit(it) {
    setEditing(it)
    setEditEnglish(it.english || '')
    setEditSpanish(it.spanish || '')
    setEditCategory(it.category || '')
    setEditDescription(it.description || '')
    setEditActive(it.active !== false)
  }

  async function saveEdit() {
    if (!editing) return
    const english = editEnglish.trim()
    const spanish = editSpanish.trim()
    if (!english || !spanish) {
      setToast('Inglés y Español son obligatorios')
      setTimeout(() => setToast(''), 1500)
      return
    }

    setSaving(true)
    try {
      const updated = await api.updateVocab(token, editing.id, {
        english,
        spanish,
        category: editCategory.trim(),
        description: editDescription.trim(),
        active: Boolean(editActive),
      })
      setItems((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
      setEditing(null)
      setToast('Guardado')
      setTimeout(() => setToast(''), 1200)
    } catch (err) {
      setToast(err?.message || 'No se pudo guardar')
      setTimeout(() => setToast(''), 1500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell
      title="Recientes"
      subtitle="Tus últimas palabras guardadas. Toca una tarjeta para copiarla."
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          onClick={load}
          disabled={loading}
        >
          Actualizar
        </button>
      }
    >
      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}

      {toast ? (
        <div className="mb-3 rounded-xl border border-zinc-200 bg-white/70 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">{toast}</div>
      ) : null}

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-zinc-400">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <div className="font-semibold">Aún no hay vocabulario</div>
            <div className="mt-1 text-zinc-400">Ve a “Agregar” para guardar tus primeras palabras.</div>
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={async () => {
                    const text = `${it.english} — ${it.spanish}`
                    try {
                      await navigator.clipboard.writeText(text)
                      setToast(`Copiado: ${text}`)
                    } catch {
                      setToast('No se pudo copiar en este navegador')
                    }
                    setTimeout(() => setToast(''), 1500)
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-semibold">{it.english}</div>
                    <div className="shrink-0 text-xs text-zinc-400">Caja {it.box}</div>
                  </div>
                  <div className="mt-1 text-zinc-700 dark:text-zinc-300">{it.spanish}</div>
                  {it.category ? <div className="mt-1 text-xs text-zinc-400">{it.category}</div> : null}
                  {it.active === false ? <div className="mt-1 text-xs text-amber-600 dark:text-amber-300">No aparece en práctica</div> : null}
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
                  onClick={() => openEdit(it)}
                >
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => (saving ? null : setEditing(null))} />
          <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Editar palabra</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Cambia el contenido y decide si aparece en práctica.</div>
              </div>
              <button
                type="button"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200"
                onClick={() => (saving ? null : setEditing(null))}
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Inglés</label>
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus:border-zinc-600"
                  value={editEnglish}
                  onChange={(e) => setEditEnglish(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Español</label>
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus:border-zinc-600"
                  value={editSpanish}
                  onChange={(e) => setEditSpanish(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Categoría (opcional)</label>
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus:border-zinc-600"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Descripción (opcional)</label>
                <textarea
                  className="min-h-24 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus:border-zinc-600"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                <div>
                  <div className="font-semibold">Incluir en práctica</div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Si lo apagas, esta palabra ya no saldrá en las prácticas.</div>
                </div>
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} disabled={saving} />
              </label>

              <button
                type="button"
                className="w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  )
}
