export default function Shell({ title, right, children }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  )
}
