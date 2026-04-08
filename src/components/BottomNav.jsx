export default function BottomNav({ active, onChange }) {
  const items = [
    { key: 'quick', label: 'Agregar' },
    { key: 'practice', label: 'Práctica' },
    { key: 'recent', label: 'Recientes' },
    { key: 'account', label: 'Cuenta' },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-2 py-2">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs ${
              active === it.key
                ? 'bg-zinc-950 text-white dark:bg-zinc-800'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}
