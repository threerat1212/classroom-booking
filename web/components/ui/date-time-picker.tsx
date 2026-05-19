'use client'

import * as React from 'react'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function toDatePart(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

function getTimePart(value?: string): string {
  return value?.slice(11, 16) || '09:00'
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'Select date and time',
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDate(value)
  const time = getTimePart(value)

  const setDateTime = (date: Date | undefined, nextTime = time) => {
    if (!date) return
    onChange(`${toDatePart(date)}T${nextTime}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            'h-10 w-full justify-between border-input bg-background px-3 py-2 text-left text-sm font-normal ring-offset-background hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {selectedDate ? `${format(selectedDate, 'MMM d, yyyy')} ${time}` : placeholder}
          </span>
          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto border-white/10 bg-slate-900 p-0 text-white">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => setDateTime(date)}
          className="border-b border-white/10"
        />
        <div className="flex items-center gap-2 p-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <Input
            type="time"
            value={time}
            onChange={(event) => setDateTime(selectedDate || new Date(), event.target.value)}
            className="border-white/10 bg-white/5 text-white [color-scheme:dark]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
