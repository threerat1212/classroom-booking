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

type TabKey = 'all' | RewardCategory | 'history'

const tabs: { id: TabKey; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'learning_boost', label: 'ช่วยเรียน' },
  { id: 'recognition', label: 'เกียรติยศ' },
  { id: 'privilege', label: 'สิทธิพิเศษ' },
  { id: 'history', label: 'แลกแล้ว' },
]

const categoryCopy: Record<RewardCategory, { label: string; tone: string; icon: ComponentType<{ className?: string }> }> = {
  learning_boost: {
    label: 'Learning Boost',
    tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
    icon: Lightbulb,
  },
  recognition: {
    label: 'Recognition',
    tone: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    icon: Medal,
  },
  privilege: {
    label: 'Classroom Privilege',
    tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    icon: ShieldCheck,
  },
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
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

const statusCopy: Record<string, { label: string; className: string }> = {
  pending: { label: 'รออนุมัติ', className: 'border-amber-500/20 bg-amber-500/10 text-amber-200' },
  approved: { label: 'อนุมัติแล้ว', className: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' },
  fulfilled: { label: 'พร้อมใช้', className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' },
  used: { label: 'ใช้แล้ว', className: 'border-slate-500/20 bg-slate-500/10 text-slate-300' },
  rejected: { label: 'ปฏิเสธ', className: 'border-rose-500/20 bg-rose-500/10 text-rose-200' },
}

function formatGold(value: number) {
  return new Intl.NumberFormat('th-TH').format(value)
}

function RewardCard({ reward, isRedeeming, onRedeem }: { reward: RewardItem; isRedeeming: boolean; onRedeem: () => void }) {
  const Icon = iconMap[reward.icon] || Gift
  const CategoryIcon = categoryCopy[reward.category].icon

  return (
    <div className="group flex min-h-[260px] flex-col rounded-xl border border-white/10 bg-white/[0.045] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-white shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{reward.name}</h3>
            <div className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${categoryCopy[reward.category].tone}`}>
              <CategoryIcon className="h-3 w-3" />
              {categoryCopy[reward.category].label}
            </div>
          </div>
        </div>
        {reward.requires_approval ? (
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-200">
            ครูอนุมัติ
          </span>
        ) : (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-200">
            ใช้ได้ทันที
          </span>
        )}
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{reward.description}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-2">
          <div className="text-slate-500">ราคา</div>
          <div className="mt-1 flex items-center gap-1 font-bold text-amber-200">
            <Coins className="h-3.5 w-3.5" />
            {formatGold(reward.price_gold)}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-2">
          <div className="text-slate-500">Level</div>
          <div className="mt-1 font-bold text-white">{reward.required_level}+</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-2">
          <div className="text-slate-500">จำกัด</div>
          <div className="mt-1 font-bold text-white">
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
        className="mt-4 h-10 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-white hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isRedeeming ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังแลก
          </span>
        ) : reward.can_redeem ? (
          'แลกรางวัล'
        ) : (
          'ยังแลกไม่ได้'
        )}
      </Button>
    </div>
  )
}

function HistoryRow({ redemption }: { redemption: RewardRedemption }) {
  const status = statusCopy[redemption.status] || statusCopy.pending
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-white">{redemption.reward_name}</h3>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
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
          { label: 'แลกได้ตอนนี้', value: counts.available, icon: Gift, tone: 'from-emerald-500/15 to-cyan-500/5 text-emerald-200' },
          { label: 'รอครูอนุมัติ', value: counts.pending, icon: Clock, tone: 'from-amber-500/15 to-orange-500/5 text-amber-200' },
          { label: 'ประวัติการแลก', value: counts.redeemed, icon: Trophy, tone: 'from-violet-500/15 to-fuchsia-500/5 text-violet-200' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border border-white/10 bg-gradient-to-br ${item.tone} p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{item.label}</span>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">{item.value}</div>
          </div>
        ))}
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
