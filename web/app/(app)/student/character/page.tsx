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

function shade(hex: string, amount: number) {
  if (!hex || !hex.startsWith('#')) return hex
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return hex
  const num = parseInt(h, 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0xff) + amount)
  const b = clamp((num & 0xff) + amount)
  return `rgb(${r}, ${g}, ${b})`
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
  const sideFlip = direction === 'left' ? 'translate(64 0) scale(-1 1)' : undefined
  const squeeze = isSide ? 'translate(32 40) scale(0.86 1) translate(-32 -40)' : undefined

  const topColor = palette(codes.top, '#64748b')
  const bottomColor = palette(codes.bottom, '#475569')
  const hairColor = palette(codes.hair, '#78350f')
  const shoesColor = palette(codes.shoes, '#e2e8f0')
  const skinBase = '#fde0c0'
  const skinShade = '#f4a87a'
  const skinOutline = '#9a3412'

  const topShade = shade(topColor, -38)
  const topLight = shade(topColor, 22)
  const bottomShade = shade(bottomColor, -38)
  const hairShade = shade(hairColor, -45)
  const hairLight = shade(hairColor, 30)
  const shoesShade = shade(shoesColor, -45)

  const backKind = variant(codes.back)
  const auraKind = variant(codes.aura)
  const hatKind = variant(codes.hat)
  const glassesKind = variant(codes.glasses)
  const hairKind = variant(codes.hair)
  const glassesColor = palette(codes.glasses, '#475569')

  const equippedNames = inventory.reduce<Record<string, string>>((acc, item) => {
    acc[item.code] = item.name
    return acc
  }, {})

  const showFace = !isBack
  const showLongHairFront = !isBack

  return (
    <div className="relative flex aspect-[5/6] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_25%,rgba(59,130,246,.18),transparent_32%),linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.98))]">
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
        viewBox="0 -8 64 88"
        className="relative z-10 h-[92%] w-[92%] drop-shadow-2xl"
        role="img"
        aria-label={`ตัวละคร ${directionLabels[direction]}`}
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        <g transform={sideFlip}>
          <g transform={squeeze}>
            {/* Floor shadow */}
            <ellipse cx="32" cy="72" rx="13" ry="1.6" fill="#000" opacity="0.45" />

            {/* === BACK ACCESSORIES (behind body) === */}
            {backKind === 'cape' && (
              <g>
                <path d="M22 34 L16 68 L24 70 L32 58 L40 70 L48 68 L42 34 Z" fill="#7c3aed" />
                <path d="M22 34 L16 68" fill="none" stroke="#3b0764" strokeWidth="0.6" />
                <path d="M42 34 L48 68" fill="none" stroke="#3b0764" strokeWidth="0.6" />
                <path d="M28 38 L26 64 M36 38 L38 64" stroke="#5b21b6" strokeWidth="0.5" opacity="0.6" />
              </g>
            )}
            {backKind === 'wings' && (
              <g>
                <path d="M22 36 L10 30 L4 42 L8 50 L18 52 L22 48 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="0.4" />
                <path d="M42 36 L54 30 L60 42 L56 50 L46 52 L42 48 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="0.4" />
                <line x1="14" y1="36" x2="20" y2="46" stroke="#d97706" strokeWidth="0.4" />
                <line x1="10" y1="42" x2="18" y2="48" stroke="#d97706" strokeWidth="0.4" />
                <line x1="50" y1="36" x2="44" y2="46" stroke="#d97706" strokeWidth="0.4" />
                <line x1="54" y1="42" x2="46" y2="48" stroke="#d97706" strokeWidth="0.4" />
              </g>
            )}
            {backKind === 'satchel' && !isBack && (
              <g>
                <rect x="38" y="40" width="10" height="13" fill="#a16207" />
                <rect x="38" y="40" width="10" height="2" fill="#78350f" />
                <rect x="40" y="43" width="6" height="2" fill="#d97706" />
                <line x1="38" y1="40" x2="26" y2="35" stroke="#78350f" strokeWidth="1" />
              </g>
            )}

            {/* === LEGS (bottom/pants) === */}
            <rect x="24" y="50" width="7" height="17" fill={bottomColor} />
            <rect x="33" y="50" width="7" height="17" fill={bottomColor} />
            {/* Leg side shading */}
            <rect x="24" y="50" width="1" height="17" fill={bottomShade} opacity="0.8" />
            <rect x="33" y="50" width="1" height="17" fill={bottomShade} opacity="0.8" />
            {/* Leg gap shadow */}
            <rect x="31" y="50" width="2" height="17" fill={bottomShade} opacity="0.4" />

            {/* === SHOES === */}
            <rect x="22" y="65" width="10" height="4" fill={shoesColor} />
            <rect x="32" y="65" width="10" height="4" fill={shoesColor} />
            <rect x="22" y="68" width="10" height="1" fill={shoesShade} />
            <rect x="32" y="68" width="10" height="1" fill={shoesShade} />
            <rect x="22" y="65" width="10" height="1" fill={shade(shoesColor, 40)} opacity="0.7" />
            <rect x="32" y="65" width="10" height="1" fill={shade(shoesColor, 40)} opacity="0.7" />

            {/* === BODY (top/shirt) === */}
            <rect x="22" y="33" width="20" height="19" fill={topColor} />
            {/* Highlight on chest */}
            <rect x="24" y="35" width="2" height="14" fill={topLight} opacity="0.6" />
            {/* Side shading */}
            <rect x="40" y="34" width="2" height="18" fill={topShade} opacity="0.6" />
            {/* Belt */}
            <rect x="22" y="49" width="20" height="3" fill={topShade} />
            <rect x="29" y="50" width="6" height="1" fill="#fbbf24" />

            {/* === ARMS === */}
            <rect x="17" y="34" width="5" height="14" fill={topColor} />
            <rect x="42" y="34" width="5" height="14" fill={topColor} />
            <rect x="17" y="46" width="5" height="2" fill={topShade} opacity="0.7" />
            <rect x="42" y="46" width="5" height="2" fill={topShade} opacity="0.7" />

            {/* === HANDS === */}
            <rect x="17" y="48" width="5" height="4" fill={skinBase} />
            <rect x="42" y="48" width="5" height="4" fill={skinBase} />
            <rect x="17" y="51" width="5" height="1" fill={skinShade} />
            <rect x="42" y="51" width="5" height="1" fill={skinShade} />

            {/* === NECK === */}
            <rect x="29" y="31" width="6" height="3" fill={skinBase} />
            <rect x="29" y="33" width="6" height="1" fill={skinShade} />

            {/* === HEAD BASE === */}
            <rect x="18" y="6" width="28" height="26" fill={skinBase} />
            {/* Chin/jaw shadow */}
            <rect x="18" y="28" width="28" height="4" fill={skinShade} opacity="0.65" />
            {/* Subtle cheek shadows */}
            <rect x="18" y="14" width="2" height="14" fill={skinShade} opacity="0.5" />
            <rect x="44" y="14" width="2" height="14" fill={skinShade} opacity="0.5" />
            {/* Outline */}
            <rect x="18" y="6" width="28" height="1" fill={skinOutline} opacity="0.5" />
            <rect x="17" y="7" width="1" height="25" fill={skinOutline} opacity="0.5" />
            <rect x="46" y="7" width="1" height="25" fill={skinOutline} opacity="0.5" />
            <rect x="18" y="31" width="28" height="1" fill={skinOutline} opacity="0.5" />

            {/* === FACE === */}
            {showFace && (
              <>
                {isSide ? (
                  <>
                    {/* Side profile: one eye + small profile mouth */}
                    <rect x="36" y="19" width="4" height="5" fill="#fff" />
                    <rect x="37" y="20" width="3" height="4" fill="#0f172a" />
                    <rect x="38" y="20" width="2" height="2" fill={hairColor} opacity="0.5" />
                    <rect x="36" y="19" width="4" height="1" fill={hairColor} />
                    {/* Mouth */}
                    <rect x="36" y="27" width="3" height="1" fill="#9a3412" />
                    {/* Nose hint */}
                    <rect x="42" y="22" width="1" height="2" fill={skinShade} />
                    {/* Blush */}
                    <rect x="34" y="25" width="3" height="2" fill="#f9a8d4" opacity="0.6" />
                  </>
                ) : (
                  <>
                    {/* Both eyes (anime-style big eyes) */}
                    <rect x="22" y="19" width="5" height="6" fill="#fff" />
                    <rect x="37" y="19" width="5" height="6" fill="#fff" />
                    {/* Eye outline */}
                    <rect x="22" y="19" width="5" height="1" fill="#0f172a" />
                    <rect x="37" y="19" width="5" height="1" fill="#0f172a" />
                    <rect x="22" y="24" width="5" height="1" fill="#0f172a" />
                    <rect x="37" y="24" width="5" height="1" fill="#0f172a" />
                    {/* Pupils */}
                    <rect x="23" y="20" width="3" height="4" fill={hairColor} />
                    <rect x="38" y="20" width="3" height="4" fill={hairColor} />
                    {/* Pupil darker center */}
                    <rect x="24" y="21" width="2" height="3" fill="#0f172a" />
                    <rect x="39" y="21" width="2" height="3" fill="#0f172a" />
                    {/* Eye highlight */}
                    <rect x="25" y="20" width="1" height="1" fill="#fff" />
                    <rect x="40" y="20" width="1" height="1" fill="#fff" />
                    {/* Mouth */}
                    <rect x="30" y="27" width="4" height="1" fill="#9a3412" />
                    <rect x="31" y="28" width="2" height="1" fill="#9a3412" opacity="0.5" />
                    {/* Blush */}
                    <rect x="20" y="25" width="3" height="2" fill="#f9a8d4" opacity="0.65" />
                    <rect x="41" y="25" width="3" height="2" fill="#f9a8d4" opacity="0.65" />
                    {/* Nose hint */}
                    <rect x="31" y="24" width="2" height="1" fill={skinShade} opacity="0.5" />
                  </>
                )}
              </>
            )}

            {/* === HAIR === */}
            {hairKind === 'novice' && (
              <g>
                {/* Top cap */}
                <rect x="18" y="6" width="28" height="6" fill={hairColor} />
                <rect x="16" y="8" width="2" height="10" fill={hairColor} />
                <rect x="46" y="8" width="2" height="10" fill={hairColor} />
                {/* Front bangs */}
                {showLongHairFront && (
                  <>
                    <rect x="20" y="12" width="4" height="6" fill={hairColor} />
                    <rect x="28" y="12" width="3" height="3" fill={hairColor} />
                    <rect x="34" y="12" width="3" height="3" fill={hairColor} />
                    <rect x="40" y="12" width="4" height="6" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="18" y="11" width="28" height="20" fill={hairColor} />}
                {/* Highlight */}
                <rect x="22" y="6" width="8" height="1" fill={hairLight} opacity="0.7" />
                <rect x="20" y="8" width="2" height="2" fill={hairLight} opacity="0.4" />
              </g>
            )}

            {hairKind === 'spiky' && (
              <g>
                {/* Wild spiky top */}
                <path d="M16 14 L18 4 L22 12 L24 2 L30 10 L32 0 L38 10 L40 2 L44 12 L46 4 L48 14 L46 16 L18 16 Z" fill={hairColor} />
                <rect x="16" y="14" width="3" height="6" fill={hairColor} />
                <rect x="45" y="14" width="3" height="6" fill={hairColor} />
                {showLongHairFront && (
                  <>
                    <rect x="20" y="14" width="4" height="4" fill={hairColor} />
                    <rect x="40" y="14" width="4" height="4" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="18" y="14" width="28" height="18" fill={hairColor} />}
                {/* Highlight tips */}
                <rect x="24" y="3" width="1" height="3" fill={hairLight} />
                <rect x="32" y="1" width="1" height="3" fill={hairLight} />
                <rect x="40" y="3" width="1" height="3" fill={hairLight} />
              </g>
            )}

            {hairKind === 'elegant' && (
              <g>
                <rect x="14" y="8" width="36" height="6" fill={hairColor} />
                <rect x="16" y="6" width="32" height="2" fill={hairColor} />
                <rect x="18" y="4" width="28" height="2" fill={hairColor} />
                {showLongHairFront ? (
                  <>
                    {/* Long flowing sides */}
                    <rect x="14" y="14" width="4" height="22" fill={hairColor} />
                    <rect x="46" y="14" width="4" height="22" fill={hairColor} />
                    <rect x="12" y="20" width="2" height="14" fill={hairColor} />
                    <rect x="50" y="20" width="2" height="14" fill={hairColor} />
                    {/* Front bangs */}
                    <rect x="20" y="14" width="6" height="4" fill={hairColor} />
                    <rect x="38" y="14" width="6" height="4" fill={hairColor} />
                  </>
                ) : (
                  <rect x="12" y="14" width="40" height="28" fill={hairColor} />
                )}
                {/* Silky highlight */}
                <rect x="22" y="8" width="20" height="1" fill={hairLight} opacity="0.7" />
                <rect x="20" y="6" width="4" height="1" fill={hairLight} opacity="0.4" />
              </g>
            )}

            {hairKind === 'flaming' && (
              <g>
                {/* Flame-shaped spikes */}
                <path d="M16 14 L18 6 L20 14 L22 4 L24 14 L26 2 L28 14 L30 4 L32 14 L34 2 L36 14 L38 4 L40 14 L42 6 L44 14 L46 4 L48 14 Z" fill={hairColor} />
                <rect x="16" y="14" width="3" height="6" fill={hairColor} />
                <rect x="45" y="14" width="3" height="6" fill={hairColor} />
                {showLongHairFront && (
                  <>
                    <rect x="20" y="14" width="3" height="4" fill={hairColor} />
                    <rect x="41" y="14" width="3" height="4" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="18" y="14" width="28" height="18" fill={hairColor} />}
                {/* Fire tips */}
                <rect x="22" y="4" width="1" height="3" fill="#fbbf24" />
                <rect x="26" y="2" width="1" height="3" fill="#fef08a" />
                <rect x="34" y="2" width="1" height="3" fill="#fef08a" />
                <rect x="42" y="6" width="1" height="3" fill="#fbbf24" />
                <rect x="46" y="4" width="1" height="3" fill="#fbbf24" />
              </g>
            )}

            {hairKind === 'silver_wave' && (
              <g>
                <rect x="14" y="8" width="36" height="6" fill={hairColor} />
                <rect x="16" y="6" width="32" height="2" fill={hairColor} />
                {showLongHairFront ? (
                  <>
                    {/* Wavy long sides */}
                    <rect x="12" y="14" width="4" height="22" fill={hairColor} />
                    <rect x="48" y="14" width="4" height="22" fill={hairColor} />
                    <rect x="10" y="18" width="2" height="14" fill={hairColor} />
                    <rect x="52" y="18" width="2" height="14" fill={hairColor} />
                    <rect x="14" y="34" width="3" height="4" fill={hairColor} />
                    <rect x="47" y="34" width="3" height="4" fill={hairColor} />
                    {/* Bangs */}
                    <rect x="20" y="14" width="4" height="4" fill={hairColor} />
                    <rect x="40" y="14" width="4" height="4" fill={hairColor} />
                  </>
                ) : (
                  <rect x="10" y="14" width="44" height="28" fill={hairColor} />
                )}
                {/* Silver shine */}
                <rect x="20" y="9" width="24" height="1" fill="#fff" opacity="0.55" />
                <rect x="14" y="18" width="1" height="14" fill="#fff" opacity="0.3" />
                <rect x="49" y="18" width="1" height="14" fill="#fff" opacity="0.3" />
              </g>
            )}

            {/* === GLASSES === */}
            {glassesKind !== 'none' && showFace && !isSide && (
              <g>
                {glassesKind === 'star' ? (
                  <g>
                    <path d="M25 19 L26 21 L28 21 L26.5 22.5 L27 24.5 L25 23 L23 24.5 L23.5 22.5 L22 21 L24 21 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
                    <path d="M39 19 L40 21 L42 21 L40.5 22.5 L41 24.5 L39 23 L37 24.5 L37.5 22.5 L36 21 L38 21 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
                  </g>
                ) : (
                  <g fill="none" stroke={glassesColor} strokeWidth="0.7">
                    <rect x="21" y="19" width="7" height="6" />
                    <rect x="36" y="19" width="7" height="6" />
                    <line x1="28" y1="22" x2="36" y2="22" />
                    {/* Lens shine */}
                    <rect x="22" y="20" width="2" height="1" fill="#fff" opacity="0.4" stroke="none" />
                    <rect x="37" y="20" width="2" height="1" fill="#fff" opacity="0.4" stroke="none" />
                  </g>
                )}
              </g>
            )}
            {glassesKind !== 'none' && showFace && isSide && glassesKind !== 'star' && (
              <g fill="none" stroke={glassesColor} strokeWidth="0.7">
                <rect x="35" y="19" width="7" height="6" />
                <rect x="34" y="22" width="2" height="0.5" />
              </g>
            )}

            {/* === HAT === */}
            {hatKind === 'bandana' && (
              <g>
                <rect x="16" y="13" width="32" height="4" fill="#ef4444" />
                <rect x="16" y="13" width="32" height="1" fill="#7f1d1d" opacity="0.7" />
                <rect x="20" y="14" width="4" height="2" fill="#fca5a5" opacity="0.7" />
                {/* Knot */}
                {!isBack && (
                  <g>
                    <rect x="46" y="14" width="4" height="3" fill="#ef4444" />
                    <rect x="48" y="17" width="3" height="2" fill="#ef4444" />
                    <rect x="48" y="13" width="3" height="2" fill="#ef4444" />
                  </g>
                )}
              </g>
            )}

            {hatKind === 'wizard' && (
              <g>
                {/* Pointy hat */}
                <path d="M14 14 L32 -4 L50 14 Z" fill="#4c1d95" />
                <rect x="12" y="13" width="40" height="3" fill="#4c1d95" />
                <rect x="12" y="12" width="40" height="1" fill="#1e1b4b" />
                <rect x="12" y="15" width="40" height="1" fill="#1e1b4b" opacity="0.6" />
                {/* Hat side darker (3D) */}
                <path d="M32 -4 L50 14 L46 14 L32 0 Z" fill="#1e1b4b" opacity="0.5" />
                {/* Star */}
                <path d="M22 4 L23 6 L25 6 L23.5 7.5 L24 9 L22 8 L20 9 L20.5 7.5 L19 6 L21 6 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
              </g>
            )}

            {hatKind === 'crown' && (
              <g>
                <rect x="18" y="6" width="28" height="3" fill="#fbbf24" />
                {/* Three spikes */}
                <path d="M18 6 L20 0 L24 6 Z" fill="#fbbf24" />
                <path d="M28 6 L32 -3 L36 6 Z" fill="#fbbf24" />
                <path d="M40 6 L44 0 L46 6 Z" fill="#fbbf24" />
                {/* Jewels */}
                <rect x="31" y="2" width="2" height="2" fill="#ef4444" />
                <rect x="21" y="3" width="1" height="1" fill="#22d3ee" />
                <rect x="43" y="3" width="1" height="1" fill="#22d3ee" />
                {/* Highlight */}
                <rect x="20" y="7" width="4" height="1" fill="#fef3c7" opacity="0.8" />
                <rect x="38" y="7" width="4" height="1" fill="#fef3c7" opacity="0.8" />
                <rect x="18" y="9" width="28" height="1" fill="#92400e" opacity="0.6" />
              </g>
            )}

            {hatKind === 'conqueror' && (
              <g>
                {/* Brim */}
                <rect x="10" y="13" width="44" height="2" fill="#0f172a" />
                <rect x="10" y="14" width="44" height="1" fill="#000" opacity="0.5" />
                {/* Top */}
                <rect x="18" y="5" width="28" height="9" fill="#0f172a" />
                <rect x="18" y="5" width="28" height="1" fill="#1f2937" />
                {/* Band */}
                <rect x="18" y="10" width="28" height="2" fill="#7c2d12" />
                {/* Feather */}
                <path d="M40 5 L46 -2 L48 4 L43 8 Z" fill="#dc2626" />
                <path d="M44 -2 L46 0" stroke="#7f1d1d" strokeWidth="0.4" />
              </g>
            )}

            {/* === AURA OVERLAY ON SPRITE === */}
            {auraKind === 'glow' && (
              <g opacity="0.55">
                <rect x="14" y="6" width="36" height="64" fill="none" stroke="#22d3ee" strokeWidth="0.4" />
                <rect x="12" y="4" width="40" height="68" fill="none" stroke="#67e8f9" strokeWidth="0.3" opacity="0.6" />
              </g>
            )}
            {auraKind === 'fire' && (
              <g>
                <path d="M14 70 L16 64 L18 70 L20 62 L22 70 L24 60 L26 70 L28 62 L30 70 L32 60 L34 70 L36 62 L38 70 L40 60 L42 70 L44 62 L46 70 L48 64 L50 70 Z" fill="#f97316" opacity="0.7" />
                <path d="M16 70 L18 66 L20 70 L22 64 L24 70 L26 64 L28 70 L30 64 L32 70 L34 64 L36 70 L38 64 L40 70 L42 64 L44 70 L46 66 L48 70 Z" fill="#fbbf24" opacity="0.8" />
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
