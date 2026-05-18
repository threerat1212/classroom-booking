import { CheckCircle, AlertTriangle, XCircle, Info, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusConfig {
  variant: BadgeVariant
  label: string
  icon: typeof CheckCircle
}

const statusMap: Record<string, StatusConfig> = {
  active: { variant: 'success', label: 'Active', icon: CheckCircle },
  available: { variant: 'success', label: 'Available', icon: CheckCircle },
  inactive: { variant: 'neutral', label: 'Inactive', icon: MinusCircle },
  pending: { variant: 'warning', label: 'Pending', icon: AlertTriangle },
  approved: { variant: 'success', label: 'Approved', icon: CheckCircle },
  rejected: { variant: 'error', label: 'Rejected', icon: XCircle },
  draft: { variant: 'neutral', label: 'Draft', icon: MinusCircle },
  published: { variant: 'success', label: 'Published', icon: CheckCircle },
  archived: { variant: 'neutral', label: 'Archived', icon: MinusCircle },
  open: { variant: 'success', label: 'Open', icon: CheckCircle },
  closed: { variant: 'neutral', label: 'Closed', icon: MinusCircle },
  cancelled: { variant: 'error', label: 'Cancelled', icon: XCircle },
  present: { variant: 'success', label: 'Present', icon: CheckCircle },
  late: { variant: 'warning', label: 'Late', icon: AlertTriangle },
  leave: { variant: 'neutral', label: 'Leave', icon: MinusCircle },
  absent: { variant: 'error', label: 'Absent', icon: XCircle },
  graded: { variant: 'success', label: 'Graded', icon: CheckCircle },
  submitted: { variant: 'info', label: 'Submitted', icon: Info },
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  error: 'bg-red-500/15 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  neutral: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] || { variant: 'neutral' as BadgeVariant, label: status, icon: Info }
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', variantStyles[config.variant], className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
