import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface RowActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function RowActions({ onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/5 hover:text-slate-200" onClick={onView}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/5 hover:text-slate-200" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  )
}
