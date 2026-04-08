import { useEffect, useMemo, useState } from 'react'
import AuthCard from './components/AuthCard'
import BottomNav from './components/BottomNav'
import { clearToken, getToken } from './lib/auth'
import QuickAdd from './screens/QuickAdd'
import Practice from './screens/Practice'
import Recent from './screens/Recent'
import Account from './screens/Account'

export default function App() {
  const [token, setToken] = useState(() => getToken())
  const [tab, setTab] = useState('quick')
  const [theme, setTheme] = useState(() => {
    const v = localStorage.getItem('ui_theme')
    if (v === 'light' || v === 'dark') return v
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    return prefersDark ? 'dark' : 'light'
  })

  const authed = useMemo(() => Boolean(token), [token])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('ui_theme', theme)
  }, [theme])

  const themeToggle = (
    <button
      type="button"
      className="fixed right-4 top-4 z-50 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-950"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {theme === 'dark' ? 'Claro' : 'Oscuro'}
    </button>
  )

  if (!authed) {
    return (
      <div className="min-h-dvh px-4 py-10">
        {themeToggle}
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="mb-6 text-center">
            <div className="text-xl font-semibold">Entrenador de Vocabulario</div>
            <div className="mt-1 text-sm text-zinc-400">Agrega rápido y practica con repetición espaciada</div>
          </div>
          <AuthCard
            onAuthed={(t) => {
              setToken(t)
              setTab('quick')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      {themeToggle}
      {tab === 'quick' ? <QuickAdd token={token} /> : null}
      {tab === 'practice' ? <Practice token={token} /> : null}
      {tab === 'recent' ? <Recent token={token} /> : null}
      {tab === 'account' ? (
        <Account
          token={token}
          onLogout={() => {
            clearToken()
            setToken('')
            setTab('quick')
          }}
        />
      ) : null}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
