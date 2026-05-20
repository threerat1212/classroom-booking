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
  common: 'border-slate-700 bg-slate-800/40 text-slate-300',
  rare: 'border-cyan-700/70 bg-cyan-950/30 text-cyan-300',
  epic: 'border-fuchsia-700/70 bg-fuchsia-950/30 text-fuchsia-300',
  legendary: 'border-amber-700/70 bg-amber-950/40 text-amber-200',
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
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60">
      <div
        className="h-7 w-7 rounded-lg border border-white/20 shadow-inner"
        style={{
          background:
            item.category === 'aura'
              ? 'conic-gradient(from 180deg, #22d3ee, #fbbf24, #c084fc, #22d3ee)'
              : palette(item.code, '#64748b'),
        }}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Sparkles className="h-6 w-6 text-amber-300" />
            ห้องแต่งตัวนักเรียน
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            แต่งตัวละครสไตล์ 2.5D sprite, หมุนดู 4 มุม และซื้อของตกแต่งด้วย Gold จาก Learning Quests
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-amber-100">
          <Coins className="h-4 w-4 text-amber-300" />
          <span className="text-sm font-bold">{gold.toLocaleString()} Gold</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Character Preview</h2>
              <p className="text-xs text-slate-500">Layered sprite mannequin</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => rotate(-1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="หมุนซ้าย"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => rotate(1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
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
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                  direction === dir
                    ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {directionLabels[dir]}
              </button>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/45 p-3">
            {equippedRows.map((row) => (
              <button
                key={row.id}
                onClick={() => setActiveSlot(row.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  activeSlot === row.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-medium">{row.label}</span>
                <span className="max-w-[190px] truncate text-xs">{row.item?.name || 'ค่าเริ่มต้น'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <ShoppingBag className="h-5 w-5 text-cyan-300" />
                ร้านค้าของตกแต่ง
              </h2>
              <p className="mt-1 text-sm text-slate-400">เลเวลสูงขึ้นจะเห็นของใหม่ ของสวยขึ้นราคาก็แรงขึ้นนิดหนึ่งครับ</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
              <Eye className="h-3.5 w-3.5 text-cyan-300" />
              กำลังดู: {slotNames[activeSlot]}
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {slots.map((slot) => {
              const Icon = slot.icon
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`flex min-w-fit items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    activeSlot === slot.id
                      ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {slot.label}
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

                return (
                  <motion.div
                    layout
                    key={item.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`flex min-h-[190px] flex-col justify-between rounded-xl border p-4 transition-all ${
                      isEquipped
                        ? 'border-cyan-400/40 bg-cyan-400/10'
                        : item.is_owned
                        ? 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                        : lockedByLevel
                        ? 'border-slate-800 bg-slate-900/50 opacity-75'
                        : 'border-amber-500/20 bg-amber-500/[0.06] hover:bg-amber-500/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <CosmeticToken item={item} />
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${rarityStyles[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-sm font-bold text-white">{item.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-1 text-xs text-amber-200">
                          <Coins className="h-3.5 w-3.5" />
                          {item.price_gold > 0 ? `${item.price_gold.toLocaleString()} Gold` : 'ฟรี'}
                        </p>
                        {item.required_level > 1 && (
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Shield className="h-3.5 w-3.5" />
                            ต้องการ Lv.{item.required_level}
                          </p>
                        )}
                        {item.required_title_code && (
                          <p className="flex items-center gap-1 text-xs text-cyan-300">
                            <Award className="h-3.5 w-3.5" />
                            ต้องมีฉายาพิเศษ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {isEquipped ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400/15 py-2 text-xs font-bold text-cyan-100">
                          <CheckCircle className="h-3.5 w-3.5" />
                          สวมใส่อยู่
                        </button>
                      ) : item.is_owned ? (
                        <button
                          onClick={() => equipMutation.mutate(item.code)}
                          disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 py-2 text-xs font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
                        >
                          สวมใส่
                        </button>
                      ) : lockedByLevel ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800/70 py-2 text-xs font-bold text-slate-500">
                          <Lock className="h-3.5 w-3.5" />
                          ยังไม่ปลดล็อก
                        </button>
                      ) : needsGold ? (
                        <button disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800/70 py-2 text-xs font-bold text-slate-500">
                          <Coins className="h-3.5 w-3.5" />
                          Gold ยังไม่พอ
                        </button>
                      ) : (
                        <button
                          onClick={() => purchaseMutation.mutate(item.code)}
                          disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
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
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-8 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">ยังไม่มีของในหมวดนี้</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
