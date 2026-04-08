import { useEffect, useMemo, useRef, useState } from 'react'
import * as api from '../lib/api'
import Shell from '../components/Shell'

function formatPct(n) {
  if (!Number.isFinite(n)) return '0%'
  return `${Math.round(n * 100)}%`
}

export default function Practice({ token }) {
  const [item, setItem] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')

  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(() => {
    const v = Number.parseInt(localStorage.getItem('practice_best_streak') || '0', 10)
    return Number.isFinite(v) ? v : 0
  })
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [reveal, setReveal] = useState(false)
  const attemptRef = useRef(0)

  // Automatic plan (no user settings). We still send a valid mode/direction to the API for compatibility.
  const [plan, setPlan] = useState({ mode: 'multiple', direction: 'en-es' })

  function computeNextPlan(p, { correct, attempt }) {
    if (!correct) return { mode: 'multiple', direction: 'en-es' }

    if (p.mode === 'multiple') return { ...p, mode: 'fill' }
    if (p.mode === 'fill') return { ...p, mode: 'write' }
    if (attempt > 0 && attempt % 3 === 0) {
      return { ...p, direction: p.direction === 'en-es' ? 'es-en' : 'en-es' }
    }
    return p
  }

  const direction = item?.direction || 'en-es'

  const promptLabel = useMemo(() => (direction === 'en-es' ? 'Inglés' : 'Español'), [direction])
  const answerLabel = useMemo(() => (direction === 'en-es' ? 'Español' : 'Inglés'), [direction])

  async function loadNext(nextPlan = plan) {
    setError('')
    setFeedback(null)
    setResponse('')
    setReveal(false)
    setLoading(true)
    try {
      const res = await api.practiceNext(token, { mode: nextPlan.mode, direction: nextPlan.direction })
      setItem(res)
    } catch (err) {
      setItem(null)
      setError(err?.message || 'No se pudo cargar una tarjeta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNext()
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
      attemptRef.current += 1
      setPlan((p) => {
        const next = computeNextPlan(p, { correct: Boolean(res?.correct), attempt: attemptRef.current })
        const delayMs = res?.correct ? 450 : 1400
        setTimeout(() => loadNext(next), delayMs)
        return next
      })

      setTotalCount((n) => n + 1)
      if (res?.correct) {
        setCorrectCount((n) => n + 1)
        setStreak((s) => {
          const next = s + 1
          setBestStreak((best) => {
            if (next > best) {
              localStorage.setItem('practice_best_streak', String(next))
              return next
            }
            return best
          })
          return next
        })
      } else {
        setStreak(0)
        setReveal(true)
      }
    } catch (err) {
      setError(err?.message || 'No se pudo enviar la respuesta')
    } finally {
      setChecking(false)
    }
  }

  const accuracy = totalCount > 0 ? correctCount / totalCount : 0

  return (
    <Shell
      title="Práctica"
      subtitle="Solo responde. La app ajusta el reto automáticamente."
      right={
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          onClick={() => loadNext()}
          disabled={loading}
        >
          Siguiente
        </button>
      }
    >
      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400">Racha</div>
            <div className="text-lg font-semibold">{streak}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Precisión</div>
            <div className="text-lg font-semibold">{formatPct(accuracy)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Mejor</div>
            <div className="text-lg font-semibold">{bestStreak}</div>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full bg-white" style={{ width: `${Math.min(100, Math.round(accuracy * 100))}%` }} />
        </div>
        <div className="mt-2 text-xs text-zinc-400">Tip: si fallas, verás la respuesta correcta para aprender más rápido.</div>
      </div>

      {error ? <div className="mb-3 text-sm text-red-300">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-zinc-400">Cargando…</div>
      ) : !item ? (
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
          <div className="font-semibold">Aún no hay tarjetas</div>
          <div className="mt-1 text-zinc-400">Agrega algunas palabras en “Agregar” y luego vuelve aquí.</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="text-xs text-zinc-400">{promptLabel}</div>
          <div className="mt-1 text-xl font-semibold">{item.prompt}</div>

          {item.description ? (
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/35 dark:text-sky-100">
              <div className="text-xs text-sky-700/80 dark:text-sky-200/80">Nota</div>
              <div className="mt-1">{item.description}</div>
            </div>
          ) : null}

          {item.mode === 'fill' && item.masked ? (
            <div className="mt-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {item.masked}
            </div>
          ) : null}

          {reveal && feedback?.expected ? (
            <div className="mt-3 rounded-xl border border-amber-900/40 bg-amber-950/40 px-3 py-2 text-sm">
              <div className="text-xs text-amber-200/80">Respuesta correcta</div>
              <div className="mt-1 font-semibold text-amber-100">{feedback.expected}</div>
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
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-900 transition hover:border-zinc-300 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700"
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
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                  placeholder="Escribe tu respuesta…"
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
                  Enviar
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={checking}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  onClick={() => {
                    // Submit a non-empty wrong answer on purpose to advance (treat as “I don’t know”).
                    submitAnswer('__skip__')
                    setReveal(true)
                  }}
                >
                  No sé
                </button>
                {feedback?.expected ? (
                  <button
                    type="button"
                    disabled={checking}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    onClick={() => setReveal((v) => !v)}
                  >
                    {reveal ? 'Ocultar' : 'Mostrar'}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {feedback ? (
            <div className="mt-4 text-sm">
              <div className={feedback.correct ? 'text-emerald-300' : 'text-amber-300'}>
                {feedback.correct ? '¡Correcto!' : 'Casi'}
              </div>
              {!feedback.correct && feedback.expected ? (
                <div className="mt-1 text-zinc-200">
                  Correcta: <span className="font-semibold">{feedback.expected}</span>
                </div>
              ) : null}
              <div className="mt-1 text-xs text-zinc-400">
                Caja {feedback.box}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Shell>
  )
}
