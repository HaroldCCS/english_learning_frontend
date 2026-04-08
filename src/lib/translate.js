export async function getTranslationSuggestions(q, { from = 'en', to = 'es', signal } = {}) {
  const text = (q || '').trim()
  if (!text) return []

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!res.ok) {
    throw new Error(`Error de traducción HTTP ${res.status}`)
  }

  const data = await res.json().catch(() => null)

  const out = []
  const seen = new Set()

  function add(t) {
    const s = (t || '').trim()
    if (!s) return
    const key = s.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(s)
  }

  add(data?.responseData?.translatedText)

  const matches = Array.isArray(data?.matches) ? data.matches.slice() : []
  matches.sort((a, b) => {
    const am = Number.parseFloat(a?.match || '0')
    const bm = Number.parseFloat(b?.match || '0')
    return bm - am
  })

  for (const m of matches) {
    add(m?.translation)
    if (out.length >= 5) break
  }

  return out
}
