import { useMemo, useState } from 'react'
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

  const authed = useMemo(() => Boolean(token), [token])

  if (!authed) {
    return (
      <div className="min-h-dvh px-4 py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="mb-6 text-center">
            <div className="text-xl font-semibold">English Vocab Trainer</div>
            <div className="mt-1 text-sm text-zinc-400">Quick-add + SRS practice (Leitner)</div>
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
