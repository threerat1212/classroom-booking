import { Inbox, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items yet',
  message = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center shadow-sm',
        compact ? 'py-10 px-6' : 'py-16 px-6',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-inset ring-slate-200">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <Button variant="brand" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
