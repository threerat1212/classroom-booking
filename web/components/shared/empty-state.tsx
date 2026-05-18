import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = 'No items yet',
  message = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-16 text-center backdrop-blur-sm">
      <div className="rounded-full bg-slate-800/50 p-4">
        <Inbox className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>
      {actionLabel && onAction && (
        <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
