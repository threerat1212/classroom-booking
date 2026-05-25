'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/context/language-context'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

const baseControlClasses =
  'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1'

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationProps) {
  const { t } = useLanguage()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    } else if (page >= totalPages - 2) {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = page - 1; i <= page + 1; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}>
      <div className="text-sm text-slate-500">
        {t('showing_results')}{' '}
        <span className="font-semibold text-slate-900">{startItem}</span> {t('to')}{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> {t('of')}{' '}
        <span className="font-semibold text-slate-900">{total}</span> {t('results')}
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            aria-label={t('per_page')}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / {t('per_page')}
              </option>
            ))}
          </select>
        )}

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={baseControlClasses}
            aria-label={t('previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getVisiblePages().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center" aria-hidden="true">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  baseControlClasses,
                  p === page &&
                    'border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700 hover:text-white',
                )}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={baseControlClasses}
            aria-label={t('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
