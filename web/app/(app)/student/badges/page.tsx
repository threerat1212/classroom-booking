'use client'

import { Award } from 'lucide-react'

const badges = [
  { title: 'Early Bird', description: 'Awarded for submitting 5 assignments before the due date.' },
  { title: 'Perfect Attendance', description: 'Awarded for 100% attendance in a month.' },
]

export default function StudentBadgesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Badges</h1>
        <p className="mt-1 text-sm text-slate-400">Achievements earned through your progress</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {badges.map((b) => (
          <div key={b.title} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-semibold text-white">{b.title}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
