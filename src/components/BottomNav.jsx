export default function BottomNav({ active, onChange }) {
  const items = [
    { key: 'quick', label: 'Quick' },
    { key: 'practice', label: 'Practice' },
    { key: 'recent', label: 'Recent' },
    { key: 'account', label: 'Account' },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-2 py-2">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs ${active === it.key ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}
