'use client'

import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Award,
  CheckCircle,
  Coins,
  Eye,
  Glasses,
  Lock,
  RotateCcw,
  RotateCw,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  CharacterItem,
  CharacterSlot,
  equipCharacterItem,
  getCharacterSummary,
  purchaseCharacterItem,
} from '@/lib/api/character'
import CharacterPaperDoll, {
  type Direction,
  type WardrobeSlot,
  defaultCodes,
  directionLabels,
  directions,
  itemCodeFor,
  palette,
  shade,
} from '@/components/character/CharacterPaperDoll'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const slots: { id: WardrobeSlot; label: string; short: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'hair', label: 'ทรงผม', short: 'Hair', icon: Sparkles },
  { id: 'hat', label: 'เครื่องหัว', short: 'Hat', icon: Star },
  { id: 'glasses', label: 'แว่นตา', short: 'Glasses', icon: Glasses },
  { id: 'top', label: 'เสื้อ', short: 'Top', icon: Shirt },
  { id: 'bottom', label: 'กางเกง', short: 'Bottom', icon: Shield },
  { id: 'shoes', label: 'รองเท้า', short: 'Shoes', icon: CheckCircle },
  { id: 'back', label: 'ของหลัง', short: 'Back', icon: Award },
  { id: 'aura', label: 'ออร่า', short: 'Aura', icon: Sparkles },
]

const rarityStyles = {
  common: 'border-slate-700/50 bg-slate-800/30 text-slate-400',
  rare: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]',
  epic: 'border-fuchsia-500/30 bg-fuchsia-950/20 text-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.1)]',
  legendary: 'border-amber-500/30 bg-amber-950/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
}

const cardRarities = {
  common: {
    border: 'border-white/5 hover:border-slate-700/50',
    glow: 'hover:shadow-[0_0_15px_rgba(148,163,184,0.04)]',
    bg: 'bg-slate-950/20 hover:bg-slate-950/40',
  },
  rare: {
    border: 'border-cyan-500/10 hover:border-cyan-500/30',
    glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]',
    bg: 'bg-cyan-950/5 hover:bg-cyan-950/15',
  },
  epic: {
    border: 'border-fuchsia-500/10 hover:border-fuchsia-500/30',
    glow: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.08)]',
    bg: 'bg-fuchsia-950/5 hover:bg-fuchsia-950/15',
  },
  legendary: {
    border: 'border-amber-500/10 hover:border-amber-500/45',
    glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]',
    bg: 'bg-amber-950/5 hover:bg-amber-950/15',
  },
}

const slotNames: Record<WardrobeSlot, string> = {
  hair: 'ทรงผม',
  hat: 'เครื่องหัว',
  glasses: 'แว่นตา',
  top: 'เสื้อ',
  bottom: 'กางเกง',
  shoes: 'รองเท้า',
  back: 'ของหลัง',
  aura: 'ออร่า',
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function booleanOr(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function CosmeticToken({ item }: { item: CharacterItem }) {
  const tokenRarityColors = {
    common: 'border-slate-800/60 bg-slate-950/70',
    rare: 'border-cyan-500/35 bg-gradient-to-br from-cyan-950/30 to-slate-950/80 shadow-[0_0_8px_rgba(6,182,212,0.1),inset_0_0_6px_rgba(6,182,212,0.08)]',
    epic: 'border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-950/30 to-slate-950/80 shadow-[0_0_8px_rgba(217,70,239,0.1),inset_0_0_6px_rgba(217,70,239,0.08)]',
    legendary: 'border-amber-500/35 bg-gradient-to-br from-amber-950/30 to-slate-950/80 shadow-[0_0_12px_rgba(245,158,11,0.15),inset_0_0_8px_rgba(245,158,11,0.1)]',
  }
  
  const itemColor = palette(item.code, '#64748b')
  const itemBg = item.category === 'aura'
    ? 'conic-gradient(from 180deg, #22d3ee, #fbbf24, #c084fc, #22d3ee)'
    : `radial-gradient(circle at center, ${itemColor} 20%, ${shade(itemColor, -30)} 90%)`

  return (
    <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover/token:scale-105 ${tokenRarityColors[item.rarity || 'common']}`}>
      <div
        className="h-8 w-8 rounded-xl border border-white/10 shadow-inner"
        style={{ background: itemBg }}
      />
    </div>
  )
}

export default function StudentCharacterPage() {
  const queryClient = useQueryClient()
  const { refreshUser } = useCurrentUser()
  const [activeSlot, setActiveSlot] = useState<WardrobeSlot>('hair')
  const [direction, setDirection] = useState<Direction>('front')

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['character-summary'],
    queryFn: async () => {
      const res = await getCharacterSummary()
      return res.data
    },
  })

  const equipMutation = useMutation({
    mutationFn: async (itemCode: string) => {
      const res = await equipCharacterItem(itemCode)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-summary'] })
    },
  })

  const purchaseMutation = useMutation({
    mutationFn: async (itemCode: string) => {
      const res = await purchaseCharacterItem(itemCode)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character-summary'] })
      refreshUser().catch(() => undefined)
    },
  })

  const rotate = (step: number) => {
    setDirection((current) => {
      const idx = directions.indexOf(current)
      return directions[(idx + step + directions.length) % directions.length]
    })
  }

  const equipped = useMemo(() => {
    const base = summary?.character?.equipped_items || {}
    return {
      ...base,
      hair: base.hair || summary?.character?.equipped_hair || defaultCodes.hair,
      hat: base.hat || summary?.character?.equipped_hat || defaultCodes.hat,
      aura: base.aura || summary?.character?.equipped_aura || defaultCodes.aura,
    } as Partial<Record<CharacterSlot, string>>
  }, [summary])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56 rounded-xl bg-white/5" />
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Skeleton className="h-[620px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[620px] rounded-2xl bg-white/5" />
        </div>
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">
        ไม่สามารถดาวน์โหลดข้อมูลตัวละครได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
      </div>
    )
  }

  const inventory = (Array.isArray(summary.inventory) ? summary.inventory : []).map((item) => {
    const isOwned = booleanOr(item.is_owned, item.is_unlocked)
    return {
      ...item,
      rarity: item.rarity || 'common',
      required_level: numberOrZero(item.required_level) || 1,
      price_gold: numberOrZero(item.price_gold),
      is_shop_item: booleanOr(item.is_shop_item, true),
      is_owned: isOwned,
      is_level_unlocked: booleanOr(item.is_level_unlocked, true),
      can_purchase: booleanOr(item.can_purchase, false),
      is_unlocked: booleanOr(item.is_unlocked, isOwned),
    }
  })
  const visibleItems = inventory.filter((item) => item.category === activeSlot && item.is_shop_item !== false)
  const equippedCode = itemCodeFor(activeSlot, equipped)
  const gold = numberOrZero(summary.gold_balance)

  const equippedRows = slots.map((slot) => {
    const code = itemCodeFor(slot.id, equipped)
    return {
      ...slot,
      code,
      item: inventory.find((candidate) => candidate.code === code),
    }
  })

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(190px); opacity: 0; }
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3.5px); }
        }
      `}</style>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            <Sparkles className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            ห้องแต่งตัวนักเรียน
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            แต่งตัวละครสไตล์ 2.5D sprite, หมุนดู 4 มุม และซื้อของตกแต่งด้วย Gold จาก Learning Quests
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-slate-900/40 backdrop-blur px-4 py-2.5 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:shadow-[0_0_20px_rgba(245,158,11,0.18)] transition-all">
          <div className="animate-[floating_2.5s_infinite_ease-in-out]">
            <Coins className="h-5 w-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          </div>
          <span className="text-sm font-extrabold tracking-wide">{gold.toLocaleString()} Gold</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="relative space-y-4 rounded-2xl border border-white/[0.05] bg-slate-950/20 p-5 backdrop-blur-xl shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:border before:border-cyan-500/5 before:pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Character Preview</h2>
              <p className="text-xs text-slate-500">Layered sprite mannequin</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => rotate(-1)}
                className="rounded-xl border border-white/5 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-white/10 hover:bg-slate-900/60 hover:text-white"
                aria-label="หมุนซ้าย"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => rotate(1)}
                className="rounded-xl border border-white/5 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-white/10 hover:bg-slate-900/60 hover:text-white"
                aria-label="หมุนขวา"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <CharacterPaperDoll equipped={equipped} inventory={inventory} direction={direction} />

          <div className="grid grid-cols-4 gap-2">
            {directions.map((dir) => (
              <button
                key={dir}
                onClick={() => setDirection(dir)}
                className={`rounded-xl border py-2 text-xs font-bold tracking-wide transition-all ${
                  direction === dir
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'border-white/5 bg-slate-900/30 text-slate-400 hover:border-white/10 hover:bg-slate-900/55 hover:text-slate-200'
                }`}
              >
                {directionLabels[dir]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-white/[0.05] bg-slate-950/50 p-3">
            {equippedRows.map((row) => {
              const SlotIcon = row.icon
              const isEquipped = row.code !== defaultCodes[row.id]
              return (
                <button
                  key={row.id}
                  onClick={() => setActiveSlot(row.id)}
                  className={`group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                    activeSlot === row.id
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                      : isEquipped
                      ? 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]'
                      : 'border-white/5 bg-slate-900/20 text-slate-500 hover:border-white/10 hover:text-slate-400'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    activeSlot === row.id
                      ? 'border-cyan-400/30 bg-cyan-950/40 text-cyan-300'
                      : isEquipped
                      ? 'border-white/10 bg-white/5 text-slate-300'
                      : 'border-white/5 bg-white/[0.02] text-slate-600 group-hover:text-slate-500'
                  }`}>
                    <SlotIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">{row.label}</p>
                    <p className={`truncate text-xs font-semibold ${
                      isEquipped ? 'text-white' : 'text-slate-600'
                    }`}>
                      {row.item?.name || 'เริ่มต้น'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="relative flex flex-col rounded-2xl border border-white/[0.05] bg-slate-900/40 p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <ShoppingBag className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.3)]" />
                ร้านค้าของตกแต่ง
              </h2>
              <p className="mt-1 text-sm text-slate-400">เลเวลสูงขึ้นจะเห็นของใหม่ ของสวยขึ้นราคาก็แรงขึ้นนิดหนึ่งครับ</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-slate-300">
              <Eye className="h-4 w-4 text-cyan-400" />
              กำลังดู: <span className="text-cyan-300">{slotNames[activeSlot]}</span>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {slots.map((slot) => {
              const Icon = slot.icon
              const isActive = activeSlot === slot.id
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`relative flex min-w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/15 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {slot.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeTabUnderline"
                      className="absolute -bottom-[2px] left-3 right-3 h-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item) => {
                const isEquipped = equippedCode === item.code
                const canAfford = gold >= item.price_gold
                const isPending = equipMutation.isPending || purchaseMutation.isPending
                const lockedByLevel = !item.is_level_unlocked
                const needsGold = item.is_level_unlocked && !item.is_owned && !canAfford

                const cardStyle = cardRarities[item.rarity || 'common']
                const currentCardStyle = isEquipped
                  ? 'border-cyan-500/45 bg-cyan-950/20 shadow-[0_0_18px_rgba(6,182,212,0.12)]'
                  : lockedByLevel
                  ? 'border-slate-800/40 bg-slate-900/10 opacity-55'
                  : `${cardStyle.border} ${cardStyle.bg} ${cardStyle.glow}`

                return (
                  <motion.div
                    layout
                    key={item.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className={`group/card relative flex min-h-[200px] flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${currentCardStyle}`}
                  >
                    {item.rarity === 'legendary' && !lockedByLevel && !isEquipped && (
                      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                        <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-[scan_3s_infinite_ease-in-out]" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="group/token">
                          <CosmeticToken item={item} />
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rarityStyles[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-1 text-sm font-bold text-slate-100 group-hover/card:text-white transition-colors">{item.name}</h3>
                      <div className="mt-2 space-y-1.5">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Coins className="h-3.5 w-3.5" />
                          {item.price_gold > 0 ? `${item.price_gold.toLocaleString()} Gold` : 'ฟรี'}
                        </p>
                        {item.required_level > 1 && (
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Shield className="h-3.5 w-3.5 text-slate-500" />
                            ต้องการ Lv.{item.required_level}
                          </p>
                        )}
                        {item.required_title_code && (
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                            <Award className="h-3.5 w-3.5 text-cyan-500" />
                            ต้องมีฉายาพิเศษ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {isEquipped ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/15 py-2.5 text-xs font-bold text-cyan-300 border border-cyan-500/25 shadow-inner">
                          <CheckCircle className="h-3.5 w-3.5" />
                          สวมใส่อยู่
                        </button>
                      ) : item.is_owned ? (
                        <button
                          onClick={() => equipMutation.mutate(item.code)}
                          disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/40 hover:bg-slate-700/60 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                          สวมใส่
                        </button>
                      ) : lockedByLevel ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900/65 border border-white/5 py-2.5 text-xs font-bold text-slate-500">
                          <Lock className="h-3.5 w-3.5" />
                          ยังไม่ปลดล็อก
                        </button>
                      ) : needsGold ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900/65 border border-white/5 py-2.5 text-xs font-bold text-slate-500">
                          <Coins className="h-3.5 w-3.5" />
                          Gold ยังไม่พอ
                        </button>
                      ) : (
                        <button
                          onClick={() => purchaseMutation.mutate(item.code)}
                          disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 py-2.5 text-xs font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)] disabled:opacity-50"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          ซื้อและสวมใส่
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {visibleItems.length === 0 && (
            <div className="mt-5 rounded-2xl border border-white/[0.05] bg-slate-950/40 p-12 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm font-semibold text-slate-400">ยังไม่มีของตกแต่งในหมวดหมู่นี้</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
