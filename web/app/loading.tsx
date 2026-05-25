import { Building2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <Building2 className="h-7 w-7 text-blue-500" />
          <span className="absolute -inset-1 rounded-2xl border-2 border-blue-500/30 border-t-blue-500 animate-spin" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-500">กำลังโหลด...</p>
      </div>
    </div>
  )
}
