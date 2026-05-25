import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import { LoadingSkeleton } from './loading-skeleton'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data?: T[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyTitle?: string
  emptyMessage?: string
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyMessage,
  page = 1,
  pageSize = 10,
  onPageChange,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingSkeleton rows={5} columns={columns.length} />
  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (!data || data.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />

  const total = data.length
  const hasPagination = !!onPageChange
  const currentPage = Math.max(1, page)
  const currentPageSize = Math.max(1, pageSize)
  const totalPages = Math.ceil(total / currentPageSize)
  const safePage = Math.min(currentPage, Math.max(1, totalPages))

  const displayData = hasPagination
    ? data.slice((safePage - 1) * currentPageSize, safePage * currentPageSize)
    : data

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {displayData.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {columns.map((col) => (
              <div key={col.key} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2 last:border-b-0">
                {col.header ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{col.header}</div>
                    <div className="min-w-0 text-sm text-slate-700">{col.cell(row)}</div>
                  </>
                ) : (
                  <div className="col-span-2 flex justify-end">{col.cell(row)}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
              {columns.map((col) => (
                <TableHead key={col.key} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {displayData.map((row, idx) => (
              <TableRow key={idx} className="group transition-colors hover:bg-blue-50/40">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-3.5 text-sm text-slate-700">
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasPagination && total > 0 && (
        <Pagination
          page={safePage}
          pageSize={currentPageSize}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
