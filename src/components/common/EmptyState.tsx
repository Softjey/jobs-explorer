import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-slate-600">{description}</p>}
      {action}
    </div>
  )
}
