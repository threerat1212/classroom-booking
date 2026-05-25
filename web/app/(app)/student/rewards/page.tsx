'use client'

import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Award,
  CheckCircle,
  Clock,
  Coins,
  FileBadge,
  Flag,
  Gift,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  Medal,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getRewardShop, redeemReward, RewardCategory, RewardItem, RewardRedemption } from '@/lib/api/rewards'
import { cn } from '@/lib/utils'

type RewardIcon = ComponentType<{ className?: string }>
type TabKey = 'all' | RewardCategory | 'history'

const tabs: { id: TabKey; label: string; icon: RewardIcon }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: Gift },
  { id: 'learning_boost', label: 'ช่วยเรียน', icon: Lightbulb },
  { id: 'recognition', label: 'เกียรติยศ', icon: Medal },
  { id: 'privilege', label: 'สิทธิพิเศษ', icon: ShieldCheck },
  { id: 'history', label: 'แลกแล้ว', icon: Trophy },
]

const categoryCopy: Record<
  RewardCategory,
  {
    label: string
    tone: string
    card: string
    icon: RewardIcon
    iconShell: string
    miniBadge: string
    cta: string
  }
> = {
  learning_boost: {
    label: 'Learning Boost',
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    card: 'border-cyan-100 bg-gradient-to-br from-white via-cyan-50/45 to-white hover:border-cyan-200',
    icon: Lightbulb,
    iconShell: 'from-cyan-400 to-blue-600 shadow-cyan-200',
    miniBadge: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    cta: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
  },
  recognition: {
    label: 'Recognition',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    card: 'border-amber-100 bg-gradient-to-br from-white via-amber-50/50 to-white hover:border-amber-200',
    icon: Medal,
    iconShell: 'from-amber-400 to-orange-500 shadow-amber-200',
    miniBadge: 'border-amber-100 bg-amber-50 text-amber-700',
    cta: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  },
  privilege: {
    label: 'Classroom Privilege',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    card: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50/45 to-white hover:border-emerald-200',
    icon: ShieldCheck,
    iconShell: 'from-emerald-400 to-teal-600 shadow-emerald-200',
    miniBadge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    cta: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
  },
}

const iconMap: Record<string, RewardIcon> = {
  lightbulb: Lightbulb,
  rotate_ccw: RotateCcw,
  message_square: MessageSquare,
  clock: Clock,
  medal: Medal,
  award: Award,
  file_badge: FileBadge,
  trophy: Trophy,
  list_checks: ListChecks,
  users: Users,
  flag: Flag,
  shield_check: ShieldCheck,
  sparkles: Sparkles,
  gift: Gift,
}

const statusCopy: Record<string, { label: string; className: string; icon: RewardIcon }> = {
  pending: { label: 'รออนุมัติ', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock },
  approved: { label: 'อนุมัติแล้ว', className: 'border-cyan-200 bg-cyan-50 text-cyan-700', icon: ShieldCheck },
  fulfilled: { label: 'พร้อมใช้', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle },
  used: { label: 'ใช้แล้ว', className: 'border-slate-200 bg-slate-100 text-slate-600', icon: CheckCircle },
  rejected: { label: 'ปฏิเสธ', className: 'border-rose-200 bg-rose-50 text-rose-700', icon: Lock },
}

function formatGold(value: number) {
  return new Intl.NumberFormat('th-TH').format(value)
}

function RewardCard({ reward, isRedeeming, onRedeem }: { reward: RewardItem; isRedeeming: boolean; onRedeem: () => void }) {
  const Icon = iconMap[reward.icon] || Gift
  const category = categoryCopy[reward.category]
  const CategoryIcon = category.icon
  const StatusIcon = reward.requires_approval ? ShieldCheck : CheckCircle
  const statusTone = reward.requires_approval
    ? 'border-violet-200 bg-violet-50 text-violet-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <div className={cn('group relative flex min-h-[260px] flex-col overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg', category.card)}>
      <div className={cn('absolute right-0 top-0 h-20 w-20 rounded-bl-full opacity-20 blur-xl', reward.requires_approval ? 'bg-violet-300' : 'bg-emerald-300')} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-200 group-hover:scale-105', category.iconShell)}>
            <Icon className="h-6 w-6" />
            <span className={cn('absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm', category.miniBadge)}>
              <CategoryIcon className="h-3 w-3" />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{reward.name}</h3>
            <div className={cn('mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', category.tone)}>
              <CategoryIcon className="h-3 w-3" />
              {category.label}
            </div>
          </div>
        </div>
        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold', statusTone)}>
          <StatusIcon className="h-3 w-3" />
          {reward.requires_approval ? 'ครูอนุมัติ' : 'ใช้ได้ทันที'}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{reward.description}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-2">
          <div className="flex items-center gap-1 text-slate-500">
            <Coins className="h-3.5 w-3.5 text-amber-600" />
            ราคา
          </div>
          <div className="mt-1 font-bold text-amber-700">
            {formatGold(reward.price_gold)}
          </div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-2">
          <div className="flex items-center gap-1 text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Level
          </div>
          <div className="mt-1 font-bold text-blue-700">{reward.required_level}+</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="flex items-center gap-1 text-slate-500">
            <Flag className="h-3.5 w-3.5 text-slate-600" />
            จำกัด
          </div>
          <div className="mt-1 font-bold text-slate-800">
            {reward.weekly_limit ? `${reward.redeemed_this_week}/${reward.weekly_limit}/สัปดาห์` : reward.max_per_user ? `${reward.redeemed_count}/${reward.max_per_user}` : 'ไม่จำกัด'}
          </div>
        </div>
      </div>

      {reward.blocked_reason && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5" />
          {reward.blocked_reason}
        </div>
      )}

      <Button
        onClick={onRedeem}
        disabled={!reward.can_redeem || isRedeeming}
        className={cn('mt-4 h-10 w-full rounded-lg bg-gradient-to-r text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45', category.cta)}
      >
        {isRedeeming ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังแลก
          </span>
        ) : reward.can_redeem ? (
          <span className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            แลกรางวัล
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            ยังแลกไม่ได้
          </span>
        )}
      </Button>
    </div>
  )
}

function HistoryRow({ redemption }: { redemption: RewardRedemption }) {
  const status = statusCopy[redemption.status] || statusCopy.pending
  const StatusIcon = status.icon
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-white">{redemption.reward_name}</h3>
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', status.className)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {new Date(redemption.requested_at).toLocaleString('th-TH')} · ใช้ {formatGold(redemption.gold_spent)} Gold
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {redemption.status === 'rejected' ? <Lock className="h-4 w-4 text-rose-300" /> : <CheckCircle className="h-4 w-4 text-emerald-300" />}
        {redemption.note || 'ไม่มีหมายเหตุ'}
      </div>
    </div>
  )
}

export default function StudentRewardsPage() {
  const queryClient = useQueryClient()
  const { refreshUser } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [activeRedeemCode, setActiveRedeemCode] = useState<string | null>(null)

  const { data: shop, isLoading, isError } = useQuery({
    queryKey: ['reward-shop'],
    queryFn: async () => {
      const res = await getRewardShop()
      return res.data
    },
  })

  const redeemMutation = useMutation({
    mutationFn: redeemReward,
    onMutate: (code) => setActiveRedeemCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-shop'] })
      refreshUser().catch(() => undefined)
    },
    onSettled: () => setActiveRedeemCode(null),
  })

  const visibleRewards = useMemo(() => {
    const rewards = shop?.rewards || []
    if (activeTab === 'all') return rewards
    if (activeTab === 'history') return []
    return rewards.filter((reward) => reward.category === activeTab)
  }, [activeTab, shop?.rewards])

  const counts = useMemo(() => {
    const rewards = shop?.rewards || []
    return {
      available: rewards.filter((reward) => reward.can_redeem).length,
      pending: (shop?.history || []).filter((item) => item.status === 'pending').length,
      redeemed: shop?.history?.length || 0,
    }
  }, [shop])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 bg-white/5" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl bg-white/5" />
          <Skeleton className="h-28 rounded-xl bg-white/5" />
          <Skeleton className="h-28 rounded-xl bg-white/5" />
        </div>
        <Skeleton className="h-[420px] rounded-xl bg-white/5" />
      </div>
    )
  }

  if (isError || !shop) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">
        ไม่สามารถโหลด Reward Shop ได้ในขณะนี้
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Reward Shop</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            ใช้ Gold จากการทำ Quest เพื่อแลกตัวช่วยการเรียน เกียรติยศ และสิทธิพิเศษในห้องเรียน โดยไม่กระทบคะแนนจริงโดยตรง
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 to-yellow-600/5 px-5 py-4 text-right">
          <div className="text-xs font-bold uppercase text-amber-200/80">Gold Balance</div>
          <div className="mt-1 flex items-center justify-end gap-2 text-3xl font-black text-white">
            <Coins className="h-6 w-6 text-amber-300" />
            {formatGold(shop.gold_balance)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'แลกได้ตอนนี้', value: counts.available, icon: Gift, tone: 'border-emerald-100 from-emerald-50 to-cyan-50 text-emerald-700', iconShell: 'bg-white/80 text-emerald-700 shadow-emerald-100' },
          { label: 'รอครูอนุมัติ', value: counts.pending, icon: Clock, tone: 'border-amber-100 from-amber-50 to-orange-50 text-amber-700', iconShell: 'bg-white/80 text-amber-700 shadow-amber-100' },
          { label: 'ประวัติการแลก', value: counts.redeemed, icon: Trophy, tone: 'border-violet-100 from-violet-50 to-fuchsia-50 text-violet-700', iconShell: 'bg-white/80 text-violet-700 shadow-violet-100' },
        ].map((item) => (
          <div key={item.label} className={cn('rounded-xl border bg-gradient-to-br p-4', item.tone)}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{item.label}</span>
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl shadow-sm', item.iconShell)}>
                <item.icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors',
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700',
            )}
          >
            <TabIcon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
          )
        })}
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-3">
          {shop.history.length > 0 ? (
            shop.history.map((item) => <HistoryRow key={item.id} redemption={item} />)
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-slate-400">
              ยังไม่มีประวัติการแลกรางวัล
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRewards.map((reward) => (
            <RewardCard
              key={reward.code}
              reward={reward}
              isRedeeming={redeemMutation.isPending && activeRedeemCode === reward.code}
              onRedeem={() => redeemMutation.mutate(reward.code)}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-emerald-300" />
          <div>
            <h2 className="text-sm font-bold text-white">กติกา Economy</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              XP ใช้แข่งขันบน leaderboard ส่วน Gold ใช้แลกรางวัลในร้านนี้ รางวัลที่มีผลกับเวลาส่งงานหรือสิทธิ์ในห้องเรียนจะเข้าคิวรอครูอนุมัติก่อนใช้งาน
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
