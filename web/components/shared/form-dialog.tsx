'use client'

import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/context/language-context'

interface FormDialogProps {
  title: string
  description?: string
  trigger?: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  submitLabel?: string
  cancelLabel?: string
  onSubmit?: () => void
  isSubmitting?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<FormDialogProps['size']>, string> = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[480px]',
  lg: 'sm:max-w-[640px]',
}

export function FormDialog({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  submitLabel,
  cancelLabel,
  onSubmit,
  isSubmitting,
  size = 'md',
}: FormDialogProps) {
  const { t } = useLanguage()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={sizeMap[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.()
          }}
          className="space-y-4"
        >
          {children}
          <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange?.(false)}>
              {cancelLabel ?? t('cancel')}
            </Button>
            <Button type="submit" variant="brand" loading={isSubmitting} loadingText={t('saving')}>
              {submitLabel ?? t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
