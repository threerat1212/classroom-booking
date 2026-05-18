'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface FilterBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onChange?: (query: string) => void
  onClear?: () => void
  children?: React.ReactNode
}

export function FilterBar({ placeholder = 'Search...', onSearch, onChange, onClear, children }: FilterBarProps) {
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder={placeholder}
          className="border-white/10 bg-white/5 pl-9 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-slate-500 transition-colors hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
      <Button type="submit" size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
        Search
      </Button>
      {query && (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-slate-400 hover:bg-white/5 hover:text-slate-200">
          Clear
        </Button>
      )}
    </form>
  )
}
