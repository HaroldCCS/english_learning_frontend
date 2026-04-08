export default function Shell({ title, subtitle, right, children }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle ? <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}
