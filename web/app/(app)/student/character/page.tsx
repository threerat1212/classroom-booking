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
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type WardrobeSlot = Exclude<CharacterSlot, 'outfit'>
type Direction = 'front' | 'right' | 'back' | 'left'

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

const directionLabels: Record<Direction, string> = {
  front: 'ด้านหน้า',
  right: 'ด้านขวา',
  back: 'ด้านหลัง',
  left: 'ด้านซ้าย',
}

const directions: Direction[] = ['front', 'right', 'back', 'left']

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

function itemCodeFor(slot: WardrobeSlot, equipped: Partial<Record<CharacterSlot, string>>) {
  return equipped[slot] || defaultCodes[slot]
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function booleanOr(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

const defaultCodes: Record<WardrobeSlot, string> = {
  hair: 'hair_novice',
  hat: 'hat_none',
  glasses: 'glasses_none',
  top: 'top_novice',
  bottom: 'bottom_novice',
  shoes: 'shoes_novice',
  back: 'back_none',
  aura: 'aura_none',
}

function variant(code?: string) {
  if (!code) return 'none'
  const [, ...parts] = code.split('_')
  return parts.join('_') || 'none'
}

function palette(code: string, fallback: string) {
  const map: Record<string, string> = {
    novice: '#94a3b8',
    spiky: '#38bdf8',
    elegant: '#c084fc',
    flaming: '#f97316',
    silver_wave: '#cbd5e1',
    bandana: '#ef4444',
    wizard: '#6d28d9',
    crown: '#fbbf24',
    conqueror: '#111827',
    round: '#e2e8f0',
    scholar: '#67e8f9',
    star: '#fde047',
    crystal: '#a78bfa',
    cardigan: '#22c55e',
    sailor: '#0ea5e9',
    royal: '#8b5cf6',
    aurora: '#06b6d4',
    school: '#334155',
    adventurer: '#92400e',
    canvas: '#f8fafc',
    wing: '#93c5fd',
    moon: '#c4b5fd',
    satchel: '#a16207',
    cape: '#7c3aed',
    wings: '#fef3c7',
  }
  return map[variant(code)] || fallback
}

function CharacterPaperDoll({
  equipped,
  inventory,
  direction,
}: {
  equipped: Partial<Record<CharacterSlot, string>>
  inventory: CharacterItem[]
  direction: Direction
}) {
  const codes = {
    hair: itemCodeFor('hair', equipped),
    hat: itemCodeFor('hat', equipped),
    glasses: itemCodeFor('glasses', equipped),
    top: itemCodeFor('top', equipped),
    bottom: itemCodeFor('bottom', equipped),
    shoes: itemCodeFor('shoes', equipped),
    back: itemCodeFor('back', equipped),
    aura: itemCodeFor('aura', equipped),
  }
  const isBack = direction === 'back'
  const isSide = direction === 'left' || direction === 'right'
  const sideFlip = direction === 'left' ? 'translate(200 0) scale(-1 1)' : undefined
  const squeeze = isSide ? 'translate(100 112) scale(.74 1) translate(-100 -112)' : undefined
  const topColor = palette(codes.top, '#64748b')
  const bottomColor = palette(codes.bottom, '#475569')
  const hairColor = palette(codes.hair, '#78350f')
  const shoesColor = palette(codes.shoes, '#e2e8f0')
  const backKind = variant(codes.back)
  const auraKind = variant(codes.aura)
  const equippedNames = inventory.reduce<Record<string, string>>((acc, item) => {
    acc[item.code] = item.name
    return acc
  }, {})

  return (
    <div className="relative flex aspect-[5/6] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_25%,rgba(59,130,246,.18),transparent_32%),linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.98))]">
      <div className="absolute inset-x-10 bottom-7 h-5 rounded-full bg-black/35 blur-md" />
      {auraKind === 'glow' && <div className="absolute h-56 w-56 rounded-full bg-cyan-400/15 blur-2xl" />}
      {auraKind === 'fire' && <div className="absolute bottom-12 h-64 w-48 rounded-full bg-orange-500/20 blur-2xl" />}
      {auraKind === 'rainbow' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="absolute h-64 w-64 rounded-full border border-dashed border-amber-200/30 bg-[conic-gradient(from_180deg,rgba(244,114,182,.16),rgba(34,211,238,.14),rgba(250,204,21,.14),rgba(167,139,250,.16),rgba(244,114,182,.16))] blur-[1px]"
        />
      )}

      <svg
        viewBox="0 0 200 240"
        className="relative z-10 h-[88%] w-[88%] drop-shadow-2xl"
        role="img"
        aria-label={`ตัวละคร ${directionLabels[direction]}`}
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="cloth-shine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <g transform={sideFlip}>
          <g transform={squeeze}>
            {backKind === 'cape' && (
              <path d="M66 98 C52 126 47 176 56 208 C82 222 122 222 148 208 C155 176 149 126 134 98 Z" fill="#6d28d9" opacity=".88" />
            )}
            {backKind === 'wings' && (
              <g opacity=".92">
                <path d="M70 106 C34 80 22 102 32 130 C42 154 54 169 78 178 C68 154 68 128 70 106 Z" fill="#fde68a" />
                <path d="M130 106 C166 80 178 102 168 130 C158 154 146 169 122 178 C132 154 132 128 130 106 Z" fill="#fde68a" />
                <path d="M54 121 L27 112 M59 139 L35 145 M143 121 L173 112 M140 139 L165 145" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" opacity=".55" />
              </g>
            )}
            {backKind === 'satchel' && !isBack && (
              <path d="M130 122 L154 143 L145 173 L120 151 Z" fill="#a16207" stroke="#78350f" strokeWidth="3" />
            )}

            <path d="M82 84 H118 V107 H82 Z" fill="#fb923c" />
            <path d="M72 105 C76 94 124 94 128 105 L137 166 C127 178 73 178 63 166 Z" fill={topColor} />
            <path d="M74 106 C82 116 118 116 126 106 L120 130 C108 137 92 137 80 130 Z" fill="url(#cloth-shine)" opacity=".55" />
            <path d="M65 112 C50 121 46 146 57 154 C65 145 69 127 72 111 Z" fill={topColor} />
            <path d="M135 112 C150 121 154 146 143 154 C135 145 131 127 128 111 Z" fill={topColor} />

            <path d="M76 164 H98 L96 205 H72 Z" fill={bottomColor} />
            <path d="M102 164 H124 L128 205 H104 Z" fill={bottomColor} />
            <path d="M69 202 H98 C101 207 99 212 91 213 H64 C61 208 63 204 69 202 Z" fill={shoesColor} stroke="#334155" strokeWidth="2" />
            <path d="M102 202 H131 C137 204 139 208 136 213 H109 C101 212 99 207 102 202 Z" fill={shoesColor} stroke="#334155" strokeWidth="2" />

            <path d="M70 54 C70 30 130 30 130 54 V76 C130 94 116 105 100 105 C84 105 70 94 70 76 Z" fill="url(#skin)" stroke="#c2410c" strokeWidth="2" />

            {variant(codes.hair) === 'spiky' && (
              <path d="M67 58 L58 37 L77 43 L85 24 L100 40 L115 24 L123 43 L142 37 L133 58 Z" fill={hairColor} stroke="#0f172a" strokeWidth="2" />
            )}
            {variant(codes.hair) === 'elegant' && (
              <g fill={hairColor} stroke="#0f172a" strokeWidth="2">
                <path d="M67 58 C68 28 132 28 133 58 C118 45 82 45 67 58 Z" />
                {!isBack && <path d="M70 75 C54 83 57 116 68 128 C76 109 78 91 70 75 Z" />}
                {!isBack && <path d="M130 75 C146 83 143 116 132 128 C124 109 122 91 130 75 Z" />}
              </g>
            )}
            {variant(codes.hair) === 'flaming' && (
              <path d="M66 60 C54 42 65 22 78 30 C82 12 98 8 103 28 C116 14 135 28 132 49 C142 53 136 66 128 70 C112 54 88 53 72 70 Z" fill={hairColor} stroke="#7f1d1d" strokeWidth="2" />
            )}
            {variant(codes.hair) === 'silver_wave' && (
              <path d="M66 60 C68 25 134 25 135 62 C127 55 126 84 117 99 C108 83 93 83 82 99 C75 83 75 54 66 60 Z" fill={hairColor} stroke="#475569" strokeWidth="2" />
            )}
            {variant(codes.hair) === 'novice' && (
              <path d="M67 59 C68 31 132 31 133 59 C124 49 111 47 101 51 C89 44 76 49 67 59 Z" fill={hairColor} stroke="#451a03" strokeWidth="2" />
            )}

            {!isBack && (
              <>
                {isSide ? (
                  <>
                    <circle cx="112" cy="70" r="3" fill="#0f172a" />
                    <path d="M118 78 Q124 82 118 86" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="88" cy="70" r="3.5" fill="#0f172a" />
                    <circle cx="112" cy="70" r="3.5" fill="#0f172a" />
                    <path d="M90 85 Q100 93 110 85" stroke="#9a3412" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </>
                )}
              </>
            )}

            {variant(codes.glasses) !== 'none' && !isBack && (
              <g stroke={palette(codes.glasses, '#e2e8f0')} strokeWidth="3" fill="none" strokeLinecap="round">
                {variant(codes.glasses) === 'star' ? (
                  <>
                    <path d="M82 66 L86 72 L93 72 L88 77 L90 84 L82 80 L75 84 L77 77 L72 72 L79 72 Z" fill="#fde047" stroke="#f59e0b" />
                    <path d="M108 66 L112 72 L119 72 L114 77 L116 84 L108 80 L101 84 L103 77 L98 72 L105 72 Z" fill="#fde047" stroke="#f59e0b" />
                  </>
                ) : (
                  <>
                    <circle cx="88" cy="72" r="9" />
                    <circle cx="112" cy="72" r="9" />
                    <path d="M97 72 H103" />
                  </>
                )}
              </g>
            )}

            {variant(codes.hat) === 'bandana' && <path d="M67 57 H133 V66 H67 Z" fill="#ef4444" />}
            {variant(codes.hat) === 'wizard' && (
              <g>
                <path d="M57 56 C65 35 82 14 100 5 C118 14 135 35 143 56 Z" fill="#4c1d95" stroke="#1e1b4b" strokeWidth="2" />
                <path d="M58 58 C74 64 126 64 142 58" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
              </g>
            )}
            {variant(codes.hat) === 'crown' && (
              <path d="M72 55 L67 34 L84 44 L100 27 L116 44 L133 34 L128 55 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
            )}
            {variant(codes.hat) === 'conqueror' && (
              <g>
                <path d="M66 58 C67 31 133 31 134 58 Z" fill="#111827" stroke="#475569" strokeWidth="3" />
                <path d="M91 38 L100 12 L109 38 Z" fill="#ef4444" />
              </g>
            )}
          </g>
        </g>
      </svg>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
        <span className="text-xs font-medium text-slate-300">{directionLabels[direction]}</span>
        <span className="truncate text-xs text-slate-500">
          {equippedNames[codes.top] || 'เสื้อเริ่มต้น'} / {equippedNames[codes.hair] || 'ผมเริ่มต้น'}
        </span>
      </div>
    </div>
  )
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
