'use client'

import { Button } from '@/components/ui/button'

export default function ExportPage() {
  const download = (path: string, filename: string) => {
    const url = `/api/v1${path}`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Export</h1>
        <p className="mt-1 text-sm text-slate-400">Download system reports as CSV files</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Attendance Report</p>
            <p className="text-sm text-slate-400">CSV export of all attendance sessions and records</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => download('/export/attendance', 'attendance.csv')}>
            Download
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Grades Report</p>
            <p className="text-sm text-slate-400">CSV export of all grade entries</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => download('/export/grades', 'grades.csv')}>
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
