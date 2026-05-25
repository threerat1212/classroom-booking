import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const baseClasses =
  'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    const stateClasses = error
      ? 'border-red-300 bg-red-50/40 focus-visible:ring-red-500 focus-visible:border-red-400'
      : 'border-input focus-visible:ring-ring'

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon ? (
            <span
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 text-slate-400',
                error && 'text-red-400',
              )}
            >
              {leftIcon}
            </span>
          ) : null}
          <input
            type={type}
            aria-invalid={error || undefined}
            className={cn(
              baseClasses,
              stateClasses,
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon ? (
            <span
              className={cn(
                'absolute right-3 top-1/2 inline-flex -translate-y-1/2 text-slate-400',
                error && 'text-red-400',
              )}
            >
              {rightIcon}
            </span>
          ) : null}
        </div>
      )
    }

    return (
      <input
        type={type}
        aria-invalid={error || undefined}
        className={cn(baseClasses, stateClasses, className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
