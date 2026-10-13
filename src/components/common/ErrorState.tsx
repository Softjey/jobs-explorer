import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center"
    >
      <CircleAlert aria-hidden className="size-8 text-red-700" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {message && <p className="text-slate-600">{message}</p>}
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}
