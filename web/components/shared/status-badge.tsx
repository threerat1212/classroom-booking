'use client'

import { CheckCircle, AlertTriangle, XCircle, Info, MinusCircle, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/context/language-context'

interface StatusBadgeProps {
  status: string
  className?: string
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusConfig {
  variant: BadgeVariant
  labelKey: string
  fallback: string
  icon: typeof CheckCircle
}

const statusMap: Record<string, StatusConfig> = {
  active: { variant: 'success', labelKey: 'status_active', fallback: 'Active', icon: CheckCircle },
  available: { variant: 'success', labelKey: 'status_available', fallback: 'Available', icon: CheckCircle },
  inactive: { variant: 'neutral', labelKey: 'status_inactive', fallback: 'Inactive', icon: MinusCircle },
  pending: { variant: 'warning', labelKey: 'status_pending', fallback: 'Pending', icon: AlertTriangle },
  approved: { variant: 'success', labelKey: 'status_approved', fallback: 'Approved', icon: CheckCircle },
  rejected: { variant: 'error', labelKey: 'status_rejected', fallback: 'Rejected', icon: XCircle },
  draft: { variant: 'neutral', labelKey: 'status_draft', fallback: 'Draft', icon: MinusCircle },
  published: { variant: 'success', labelKey: 'status_published', fallback: 'Published', icon: CheckCircle },
  archived: { variant: 'neutral', labelKey: 'status_archived', fallback: 'Archived', icon: MinusCircle },
  open: { variant: 'success', labelKey: 'status_open', fallback: 'Open', icon: CheckCircle },
  closed: { variant: 'neutral', labelKey: 'status_closed', fallback: 'Closed', icon: MinusCircle },
  cancelled: { variant: 'error', labelKey: 'status_cancelled', fallback: 'Cancelled', icon: XCircle },
  present: { variant: 'success', labelKey: 'status_present', fallback: 'Present', icon: CheckCircle },
  late: { variant: 'warning', labelKey: 'status_late', fallback: 'Late', icon: AlertTriangle },
  leave: { variant: 'neutral', labelKey: 'status_leave', fallback: 'Leave', icon: MinusCircle },
  absent: { variant: 'error', labelKey: 'status_absent', fallback: 'Absent', icon: XCircle },
  graded: { variant: 'success', labelKey: 'status_graded', fallback: 'Graded', icon: CheckCircle },
  submitted: { variant: 'info', labelKey: 'status_submitted', fallback: 'Submitted', icon: Info },
  maintenance: { variant: 'warning', labelKey: 'status_maintenance', fallback: 'Maintenance', icon: Wrench },
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useLanguage()
  const config = statusMap[status.toLowerCase()] ?? {
    variant: 'neutral' as BadgeVariant,
    labelKey: '',
    fallback: status,
    icon: Info,
  }
  const Icon = config.icon
  const label = config.labelKey ? t(config.labelKey as any) || config.fallback : config.fallback
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        variantStyles[config.variant],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
