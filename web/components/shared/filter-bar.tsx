'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/lib/context/language-context'

interface FilterBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onChange?: (query: string) => void
  onClear?: () => void
  children?: React.ReactNode
  hideSubmit?: boolean
}
export function FilterBar({
  placeholder,
  onSearch,
  onChange,
  onClear,
  children,
  hideSubmit = false,
}: FilterBarProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  const handleChange = (value: string) => {
    setQuery(value)
    onChange?.(value)
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2"
      role="search"
      aria-label={t('search')}
    >
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Input
          type="text"
          placeholder={placeholder ?? t('search_placeholder')}
          className="h-10 border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label={t('search')}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('clear')}
            className="focus-ring absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
      {!hideSubmit && (
        <Button type="submit" variant="brand" size="sm">
          {t('search')}
        </Button>
      )}
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          {t('clear')}
        </Button>
      )}
    </form>
  )
}

/**
 * Small helper for inline status / category select dropdowns used in filter bars.
 * Provides consistent styling so pages don't ship dark-theme classes on a light surface.
 */
export function FilterSelect({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={
        'h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ' +
        className
      }
      {...props}
    >
      {children}
    </select>
  )
}
