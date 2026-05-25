import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pulse' | 'shimmer'
}

function Skeleton({ className, variant = 'shimmer', ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'rounded-md',
        variant === 'pulse' ? 'animate-pulse bg-slate-200' : 'skeleton-shimmer',
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { Skeleton }
