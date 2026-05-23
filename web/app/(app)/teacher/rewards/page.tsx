'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Clock, Coins, Gift, Loader2, MessageSquare, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { listRewardRedemptions, RedemptionStatus, RewardRedemption, updateRewardRedemption } from '@/lib/api/rewards'

type FilterKey = 'all' | RedemptionStatus

const tabs: { id: FilterKey; label: string }[] = [
  { id: 'pending', label: 'รออนุมัติ' },
  { id: 'approved', label: 'อนุมัติแล้ว' },
  { id: 'used', label: 'ใช้แล้ว' },
  { id: 'rejected', label: 'ปฏิเสธ' },
  { id: 'all', label: 'ทั้งหมด' },
]

const statusStyle: Record<RedemptionStatus, string> = {
  pending: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  approved: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
  fulfilled: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  used: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-200',
}

const statusLabel: Record<RedemptionStatus, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  fulfilled: 'พร้อมใช้',
  used: 'ใช้แล้ว',
  rejected: 'ปฏิเสธ',
}

function formatGold(value: number) {
  return new Intl.NumberFormat('th-TH').format(value)
}

function RequestCard({
  item,
  busy,
  onUpdate,
}: {
  item: RewardRedemption
  busy: boolean
  onUpdate: (status: RedemptionStatus, note?: string) => void
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-white">{item.reward_name}</h2>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyle[item.status]}`}>
              {statusLabel[item.status]}
            </span>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
            <p>{item.student_name || 'Student'} · {item.student_email || '-'}</p>
            <p>{new Date(item.requested_at).toLocaleString('th-TH')}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-200">
              <Coins className="h-3.5 w-3.5" />
              {formatGold(item.gold_spent)} Gold
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1">
              <Gift className="h-3.5 w-3.5" />
              {item.reward_category}
            </span>
          </div>
          {item.note && (
            <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2 text-xs leading-5 text-slate-300">
              {item.note}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {item.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdate('approved', 'Approved for teacher action')}
                disabled={busy}
                className="gap-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate('rejected', 'Rejected by teacher')}
                disabled={busy}
                className="gap-2 rounded-lg border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {(item.status === 'approved' || item.status === 'fulfilled') && (
            <Button
              size="sm"
              onClick={() => onUpdate('used', 'Reward fulfilled in class')}
              disabled={busy}
              className="gap-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Mark Used
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TeacherRewardsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<FilterKey>('pending')
  const [activeID, setActiveID] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reward-redemptions'],
    queryFn: async () => (await listRewardRedemptions()).data,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: RedemptionStatus; note?: string }) => updateRewardRedemption(id, { status, note }),
    onMutate: ({ id }) => setActiveID(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] }),
    onSettled: () => setActiveID(null),
  })

  const visibleItems = useMemo(() => {
    const items = data || []
    if (activeTab === 'all') return items
    return items.filter((item) => item.status === activeTab)
  }, [activeTab, data])

  const pendingCount = (data || []).filter((item) => item.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Reward Requests</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            จัดการคำขอรางวัลที่ต้องให้ครูอนุมัติ เช่น Fast Feedback, Certificate, Team Banner และ privilege จาก Reward Shop
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-100">
            <Clock className="h-4 w-4" />
            {pendingCount} pending
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === tab.id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-xl bg-white/5" />
          <Skeleton className="h-28 rounded-xl bg-white/5" />
          <Skeleton className="h-28 rounded-xl bg-white/5" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">
          ไม่สามารถโหลดคำขอรางวัลได้
        </div>
      )}

      {!isLoading && !isError && visibleItems.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-white">ยังไม่มีคำขอในหมวดนี้</p>
          <p className="mt-1 text-xs text-slate-500">เมื่อนักเรียนแลกรางวัลที่ต้องอนุมัติ รายการจะมาอยู่ที่นี่</p>
        </div>
      )}

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <RequestCard
            key={item.id}
            item={item}
            busy={updateMutation.isPending && activeID === item.id}
            onUpdate={(status, note) => updateMutation.mutate({ id: item.id, status, note })}
          />
        ))}
      </div>
    </div>
  )
}
