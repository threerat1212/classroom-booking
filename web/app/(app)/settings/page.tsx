'use client'

import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage application preferences</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-4">
        <p className="text-sm text-slate-400">Settings will be available in a future update.</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Dark Mode</span>
          <Button variant="outline" size="sm" disabled>
            Toggle
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Email Notifications</span>
          <Button variant="outline" size="sm" disabled>
            Toggle
          </Button>
        </div>
      </div>
    </div>
  )
}
