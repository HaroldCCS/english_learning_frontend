import { useEffect, useMemo, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'

function normalizeMode(m) {
  if (m === 'write' || m === 'fill' || m === 'multiple') return m
  return 'multiple'
}

function normalizeDir(d) {
  if (d === 'es-en' || d === 'en-es') return d
  return 'en-es'
}

export default function Practice({ token }) {
  const [mode, setMode] = useState('multiple')
  const [direction, setDirection] = useState('en-es')
  const [item, setItem] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')

  const promptLabel = useMemo(() => (direction === 'en-es' ? 'English' : 'Spanish'), [direction])
  const answerLabel = useMemo(() => (direction === 'en-es' ? 'Spanish' : 'English'), [direction])

  async function loadNext(nextMode = mode, nextDir = direction) {
    setError('')
    setFeedback(null)
    setResponse('')
    setLoading(true)
    try {
      const res = await api.practiceNext(token, { mode: normalizeMode(nextMode), direction: normalizeDir(nextDir) })
      setItem(res)
    } catch (err) {
      setItem(null)
      setError(err?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNext(mode, direction)
  }, [])

  async function submitAnswer(value) {
    if (!item) return
    const v = (value ?? response).trim()
    if (!v) return

    setChecking(true)
    setError('')
    try {
      const res = await api.practiceAnswer(token, {
        cardId: item.cardId,
        mode: item.mode,
        direction: item.direction,
        response: v,
      })
      setFeedback(res)
      setTimeout(() => loadNext(mode, direction), 350)
    } catch (err) {
      setError(err?.message || 'Failed')
    } finally {
      setChecking(false)
    }
  }

  return (
    <Shell
      title="Practice"
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
          onClick={() => loadNext(mode, direction)}
          disabled={loading}
        >
          Next
        </button>
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-2">
        <select
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          value={mode}
          onChange={(e) => {
            const m = e.target.value
            setMode(m)
            loadNext(m, direction)
          }}
        >
          <option value="multiple">Multiple choice</option>
          <option value="write">Write</option>
          <option value="fill">Fill</option>
        </select>

        <select
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          value={direction}
          onChange={(e) => {
            const d = e.target.value
            setDirection(d)
            loadNext(mode, d)
          }}
        >
          <option value="en-es">EN → ES</option>
          <option value="es-en">ES → EN</option>
        </select>
      </div>

      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-zinc-400">Loading…</div>
      ) : !item ? (
        <div className="text-sm text-zinc-400">No card yet.</div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs text-zinc-400">{promptLabel}</div>
          <div className="mt-1 text-xl font-semibold">{item.prompt}</div>

          {item.mode === 'fill' && item.masked ? (
            <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
              {item.masked}
            </div>
          ) : null}

          {item.mode === 'multiple' && Array.isArray(item.choices) ? (
            <div className="mt-4 grid grid-cols-1 gap-2">
              {item.choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => submitAnswer(c)}
                  disabled={checking}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-100 disabled:opacity-60"
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <div className="mb-1 text-xs text-zinc-400">{answerLabel}</div>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={checking}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitAnswer()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => submitAnswer()}
                  disabled={checking || !response.trim()}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {feedback ? (
            <div className="mt-4 text-sm">
              <div className={feedback.correct ? 'text-emerald-300' : 'text-amber-300'}>
                {feedback.correct ? 'Correct' : 'Wrong'}
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                Box {feedback.box}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Shell>
  )
}
