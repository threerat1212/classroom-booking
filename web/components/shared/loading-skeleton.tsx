import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
}

export function LoadingSkeleton({ rows = 5, columns = 4 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-8 flex-1 bg-white/10" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={`r-${ri}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, ci) => (
            <Skeleton key={`c-${ci}`} className="h-6 flex-1 bg-white/10" />
          ))}
        </div>
      ))}
    </div>
  )
}
