import { useEffect, useRef, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'
import { getTranslationSuggestions } from '../lib/translate'

export default function QuickAdd({ token }) {
  const [english, setEnglish] = useState('')
  const [spanish, setSpanish] = useState('')
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
      category: category.trim(),
    }
    if (!payload.english || !payload.spanish) return

    setError('')
    setSaving(true)

    setEnglish('')
    setSpanish('')
    setSuggestions([])

    try {
      const res = await api.quickAddVocab(token, payload)
      setLastSaved(res)
      setTimeout(() => englishRef.current?.focus(), 0)
    } catch (err) {
      setError(err?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell
      title="Quick Add"
      right={<div className="text-xs text-zinc-400">{saving ? 'saving…' : ''}</div>}
    >
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">English</label>
          <input
            ref={englishRef}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            required
            disabled={saving}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Spanish</label>
          <input
            ref={spanishRef}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={spanish}
            onChange={(e) => setSpanish(e.target.value)}
            required
            disabled={saving}
          />
          {suggesting ? <div className="mt-2 text-xs text-zinc-400">suggesting…</div> : null}
          {!saving && suggestions.length ? (
            <div className="mt-2 grid gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200 hover:border-zinc-700"
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
          <label className="mb-1 block text-sm text-zinc-300">Category (optional)</label>
          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={saving}
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          disabled={saving || !english.trim() || !spanish.trim()}
        >
          Add
        </button>
      </form>

      {lastSaved ? (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm">
          <div className="text-zinc-300">Saved</div>
          <div className="mt-1 font-semibold">{lastSaved.english}</div>
          <div className="text-zinc-300">{lastSaved.spanish}</div>
        </div>
      ) : null}
    </Shell>
  )
}
