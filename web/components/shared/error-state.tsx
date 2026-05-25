import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title,
  message = 'Something went wrong',
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50 to-rose-50/40 py-12 px-6 text-center shadow-sm',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-inset ring-red-100">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950">
        {title ?? 'Error'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-600">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={onRetry}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          {retryLabel ?? 'Retry'}
        </Button>
      )}
    </div>
  )
}
