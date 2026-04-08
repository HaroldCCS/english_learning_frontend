import { useEffect, useRef, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'
import { getTranslationSuggestions } from '../lib/translate'

export default function QuickAdd({ token }) {
  const [english, setEnglish] = useState('')
  const [spanish, setSpanish] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [suggesting, setSuggesting] = useState(false)

  const englishRef = useRef(null)
  const spanishRef = useRef(null)

  useEffect(() => {
    if (saving) return

    const q = english.trim()
    if (q.length < 2) {
      setSuggestions([])
      setSuggesting(false)
      return
    }

    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        setSuggesting(true)
        const res = await getTranslationSuggestions(q, { signal: controller.signal })
        setSuggestions(res)
      } catch (err) {
        if (err?.name === 'AbortError') return
        setSuggestions([])
      } finally {
        setSuggesting(false)
      }
    }, 350)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [english, saving])

  async function onSubmit(e) {
    e.preventDefault()
    const payload = {
      english: english.trim(),
      spanish: spanish.trim(),
      description: description.trim(),
      category: category.trim(),
    }
    if (!payload.english || !payload.spanish) return

    setError('')
    setSaving(true)

    setEnglish('')
    setSpanish('')
    setDescription('')
    setSuggestions([])

    try {
      const res = await api.quickAddVocab(token, payload)
      setLastSaved(res)
      setTimeout(() => englishRef.current?.focus(), 0)
    } catch (err) {
      setError(err?.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell
      title="Agregar"
      subtitle="Escribe una palabra en inglés y elige una sugerencia en español (o escríbela tú)."
      right={<div className="text-xs text-zinc-400">{saving ? 'guardando…' : ''}</div>}
    >
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div>
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Inglés</label>
          <input
            ref={englishRef}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            required
            disabled={saving}
          />
          <div className="mt-2 text-xs text-zinc-400">Tip: al escribir, aparecerán sugerencias de traducción.</div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Español</label>
          <input
            ref={spanishRef}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            value={spanish}
            onChange={(e) => setSpanish(e.target.value)}
            required
            disabled={saving}
          />
          <div className="mt-2 text-xs text-zinc-400">Toca una sugerencia para rellenar, o edita el campo para dejarlo a tu manera.</div>
          {suggesting ? <div className="mt-2 text-xs text-zinc-400">buscando sugerencias…</div> : null}
          {!saving && suggestions.length ? (
            <div className="mt-2 grid gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-800 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
                  onClick={() => {
                    setSpanish(s)
                    setTimeout(() => spanishRef.current?.focus(), 0)
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Categoría (opcional)</label>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={saving}
          />
          <div className="mt-2 text-xs text-zinc-400">Ej: trabajo, viajes, comida.</div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Descripción (opcional)</label>
          <textarea
            className="min-h-20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            placeholder="Ej: se usa cuando hablas en pasado; común en contexto de trabajo…"
          />
          <div className="mt-2 text-xs text-zinc-400">Esto te aparecerá como una nota durante la práctica.</div>
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          disabled={saving || !english.trim() || !spanish.trim()}
        >
          Guardar
        </button>
      </form>

      {lastSaved ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="text-zinc-500 dark:text-zinc-300">Guardado</div>
          <div className="mt-1 font-semibold">{lastSaved.english}</div>
          <div className="text-zinc-700 dark:text-zinc-300">{lastSaved.spanish}</div>
          {lastSaved.description ? <div className="mt-1 text-xs text-zinc-400">{lastSaved.description}</div> : null}
        </div>
      ) : null}
    </Shell>
  )
}
