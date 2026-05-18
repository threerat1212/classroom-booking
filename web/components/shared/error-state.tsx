import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/5 py-16 text-center backdrop-blur-sm">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">Error</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
