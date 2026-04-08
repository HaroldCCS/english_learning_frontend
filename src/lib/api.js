const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  const isJSON = contentType.includes('application/json')
  const data = isJSON ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function register(email, password) {
  return request('/api/auth/register', { method: 'POST', body: { email, password } })
}

export async function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } })
}

export async function me(token) {
  return request('/api/me', { token })
}

export async function quickAddVocab(token, { english, spanish, category }) {
  return request('/api/vocab', { method: 'POST', token, body: { english, spanish, category } })
}

export async function recentVocab(token) {
  return request('/api/vocab/recent', { token })
}

export async function practiceNext(token, { mode, direction }) {
  return request('/api/practice/next', { method: 'POST', token, body: { mode, direction } })
}

export async function practiceAnswer(token, { cardId, mode, direction, response }) {
  return request('/api/practice/answer', { method: 'POST', token, body: { cardId, mode, direction, response } })
}
