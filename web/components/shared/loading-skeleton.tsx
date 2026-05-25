import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
}

export function LoadingSkeleton({ rows = 5, columns = 4 }: LoadingSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-3.5">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, ri) => (
          <div key={`r-${ri}`} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, ci) => (
              <Skeleton
                key={`c-${ci}`}
                className="h-4 flex-1"
                style={{ opacity: 1 - ri * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
