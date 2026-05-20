'use client'

import { motion } from 'framer-motion'
import { CharacterItem, CharacterSlot } from '@/lib/api/character'

export type WardrobeSlot = Exclude<CharacterSlot, 'outfit'>
export type Direction = 'front' | 'right' | 'back' | 'left'

export const directions: Direction[] = ['front', 'right', 'back', 'left']

export const directionLabels: Record<Direction, string> = {
  front: 'ด้านหน้า',
  right: 'ด้านขวา',
  back: 'ด้านหลัง',
  left: 'ด้านซ้าย',
}

export const defaultCodes: Record<WardrobeSlot, string> = {
  hair: 'hair_novice',
  hat: 'hat_none',
  glasses: 'glasses_none',
  top: 'top_novice',
  bottom: 'bottom_novice',
  shoes: 'shoes_novice',
  back: 'back_none',
  aura: 'aura_none',
}

export function itemCodeFor(slot: WardrobeSlot, equipped: Partial<Record<CharacterSlot, string>>) {
  return equipped[slot] || defaultCodes[slot]
}

export function variant(code?: string) {
  if (!code) return 'none'
  const [, ...parts] = code.split('_')
  return parts.join('_') || 'none'
}

export function palette(code: string, fallback: string) {
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

export function shade(hex: string, amount: number) {
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

export default function CharacterPaperDoll({
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
        viewBox="0 0 64 80"
        className="relative z-10 h-[92%] w-[92%] drop-shadow-2xl"
        role="img"
        aria-label={`ตัวละคร ${directionLabels[direction]}`}
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          <style>{`
            @keyframes breathe {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-1.5px); }
            }
          `}</style>
        </defs>
        <g transform={sideFlip}>
          <g transform={squeeze}>
            <g style={{ animation: 'breathe 2.2s ease-in-out infinite' }}>
              {/* Floor shadow */}
              <ellipse cx="32" cy="74" rx="14" ry="2" fill="#000" opacity="0.35" />

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

            {/* === LEGS (chibi short) === */}
            <rect x="23" y="48" width="7" height="10" fill={bottomColor} />
            <rect x="34" y="48" width="7" height="10" fill={bottomColor} />
            <rect x="23" y="48" width="1" height="10" fill={bottomShade} opacity="0.8" />
            <rect x="34" y="48" width="1" height="10" fill={bottomShade} opacity="0.8" />
            <rect x="30" y="48" width="4" height="10" fill={bottomShade} opacity="0.3" />

            {/* === SHOES === */}
            <rect x="21" y="56" width="11" height="4" fill={shoesColor} />
            <rect x="32" y="56" width="11" height="4" fill={shoesColor} />
            <rect x="21" y="59" width="11" height="1" fill={shoesShade} />
            <rect x="32" y="59" width="11" height="1" fill={shoesShade} />
            <rect x="21" y="56" width="11" height="1" fill={shade(shoesColor, 40)} opacity="0.7" />
            <rect x="32" y="56" width="11" height="1" fill={shade(shoesColor, 40)} opacity="0.7" />

            {/* === BODY (chibi top-down) === */}
            <g>
              <path d="M18 34 L46 34 L44 48 L20 48 Z" fill={topColor} />
              <rect x="18" y="34" width="28" height="3" fill={topShade} opacity="0.6" />
              <rect x="20" y="36" width="24" height="2" fill={topLight} opacity="0.4" />
            </g>
            <rect x="20" y="46" width="24" height="3" fill={topShade} />
            <rect x="29" y="47" width="6" height="1" fill="#fbbf24" />

            {/* === ARMS (chibi short) === */}
            <rect x="14" y="36" width="5" height="10" fill={topColor} />
            <rect x="45" y="36" width="5" height="10" fill={topColor} />
            <rect x="14" y="44" width="5" height="2" fill={topShade} opacity="0.7" />
            <rect x="45" y="44" width="5" height="2" fill={topShade} opacity="0.7" />

            {/* === HANDS === */}
            <rect x="14" y="45" width="5" height="4" fill={skinBase} />
            <rect x="45" y="45" width="5" height="4" fill={skinBase} />
            <rect x="14" y="48" width="5" height="1" fill={skinShade} />
            <rect x="45" y="48" width="5" height="1" fill={skinShade} />

            {/* === NECK === */}
            <rect x="28" y="31" width="8" height="4" fill={skinBase} />
            <rect x="28" y="34" width="8" height="1" fill={skinShade} />

            {/* === HEAD (chibi big) === */}
            <rect x="14" y="4" width="36" height="28" fill={skinBase} />
            <rect x="14" y="28" width="36" height="4" fill={skinShade} opacity="0.65" />
            <rect x="14" y="16" width="3" height="14" fill={skinShade} opacity="0.4" />
            <rect x="47" y="16" width="3" height="14" fill={skinShade} opacity="0.4" />
            <rect x="14" y="4" width="36" height="1" fill={skinOutline} opacity="0.5" />
            <rect x="13" y="5" width="1" height="27" fill={skinOutline} opacity="0.5" />
            <rect x="50" y="5" width="1" height="27" fill={skinOutline} opacity="0.5" />
            <rect x="14" y="31" width="36" height="1" fill={skinOutline} opacity="0.5" />

            {/* === FACE === */}
            {showFace && (
              <>
                {isSide ? (
                  <>
                    <rect x="38" y="18" width="5" height="6" fill="#fff" />
                    <rect x="39" y="19" width="4" height="5" fill="#0f172a" />
                    <rect x="40" y="19" width="3" height="3" fill={hairColor} opacity="0.5" />
                    <rect x="38" y="18" width="5" height="1" fill={hairColor} />
                    <rect x="38" y="27" width="4" height="1" fill="#9a3412" />
                    <rect x="45" y="21" width="1" height="2" fill={skinShade} />
                    <rect x="36" y="24" width="4" height="2" fill="#f9a8d4" opacity="0.6" />
                  </>
                ) : (
                  <>
                    <rect x="20" y="18" width="7" height="8" fill="#fff" />
                    <rect x="37" y="18" width="7" height="8" fill="#fff" />
                    <rect x="20" y="18" width="7" height="1" fill="#0f172a" />
                    <rect x="37" y="18" width="7" height="1" fill="#0f172a" />
                    <rect x="20" y="25" width="7" height="1" fill="#0f172a" />
                    <rect x="37" y="25" width="7" height="1" fill="#0f172a" />
                    <rect x="22" y="20" width="4" height="5" fill={hairColor} />
                    <rect x="39" y="20" width="4" height="5" fill={hairColor} />
                    <rect x="23" y="21" width="3" height="4" fill="#0f172a" />
                    <rect x="40" y="21" width="3" height="4" fill="#0f172a" />
                    <rect x="25" y="20" width="1" height="2" fill="#fff" />
                    <rect x="42" y="20" width="1" height="2" fill="#fff" />
                    <rect x="30" y="28" width="4" height="1" fill="#9a3412" />
                    <rect x="31" y="29" width="2" height="1" fill="#9a3412" opacity="0.5" />
                    <rect x="18" y="26" width="4" height="2" fill="#f9a8d4" opacity="0.65" />
                    <rect x="42" y="26" width="4" height="2" fill="#f9a8d4" opacity="0.65" />
                    <rect x="31" y="25" width="2" height="1" fill={skinShade} opacity="0.5" />
                  </>
                )}
              </>
            )}

            {/* === HAIR === */}
            {hairKind === 'novice' && (
              <g>
                <rect x="14" y="4" width="36" height="7" fill={hairColor} />
                <rect x="12" y="6" width="3" height="12" fill={hairColor} />
                <rect x="49" y="6" width="3" height="12" fill={hairColor} />
                {showLongHairFront && (
                  <>
                    <rect x="16" y="11" width="5" height="8" fill={hairColor} />
                    <rect x="25" y="11" width="4" height="4" fill={hairColor} />
                    <rect x="35" y="11" width="4" height="4" fill={hairColor} />
                    <rect x="43" y="11" width="5" height="8" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="14" y="10" width="36" height="22" fill={hairColor} />}
                <rect x="20" y="4" width="10" height="1" fill={hairLight} opacity="0.7" />
                <rect x="16" y="6" width="3" height="3" fill={hairLight} opacity="0.4" />
              </g>
            )}

            {hairKind === 'spiky' && (
              <g>
                <path d="M12 14 L14 2 L18 12 L20 0 L26 10 L28 0 L34 10 L36 0 L42 10 L44 2 L48 12 L50 0 L52 14 L50 16 L14 16 Z" fill={hairColor} />
                <rect x="12" y="14" width="4" height="8" fill={hairColor} />
                <rect x="48" y="14" width="4" height="8" fill={hairColor} />
                {showLongHairFront && (
                  <>
                    <rect x="16" y="14" width="5" height="6" fill={hairColor} />
                    <rect x="43" y="14" width="5" height="6" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="14" y="14" width="36" height="20" fill={hairColor} />}
                <rect x="20" y="1" width="1" height="4" fill={hairLight} />
                <rect x="28" y="0" width="1" height="4" fill={hairLight} />
                <rect x="38" y="1" width="1" height="4" fill={hairLight} />
              </g>
            )}

            {hairKind === 'elegant' && (
              <g>
                <rect x="10" y="8" width="44" height="7" fill={hairColor} />
                <rect x="12" y="6" width="40" height="2" fill={hairColor} />
                <rect x="14" y="4" width="36" height="2" fill={hairColor} />
                {showLongHairFront ? (
                  <>
                    <rect x="10" y="15" width="5" height="24" fill={hairColor} />
                    <rect x="49" y="15" width="5" height="24" fill={hairColor} />
                    <rect x="8" y="22" width="3" height="16" fill={hairColor} />
                    <rect x="53" y="22" width="3" height="16" fill={hairColor} />
                    <rect x="16" y="15" width="8" height="5" fill={hairColor} />
                    <rect x="40" y="15" width="8" height="5" fill={hairColor} />
                  </>
                ) : (
                  <rect x="8" y="15" width="48" height="30" fill={hairColor} />
                )}
                <rect x="22" y="9" width="22" height="1" fill={hairLight} opacity="0.7" />
                <rect x="18" y="7" width="5" height="1" fill={hairLight} opacity="0.4" />
              </g>
            )}

            {hairKind === 'flaming' && (
              <g>
                <path d="M12 14 L14 6 L16 14 L18 4 L20 14 L22 2 L24 14 L26 4 L28 14 L30 2 L32 14 L34 4 L36 14 L38 2 L40 14 L42 6 L44 14 L46 4 L48 14 L50 2 L52 14 Z" fill={hairColor} />
                <rect x="12" y="14" width="4" height="8" fill={hairColor} />
                <rect x="48" y="14" width="4" height="8" fill={hairColor} />
                {showLongHairFront && (
                  <>
                    <rect x="16" y="14" width="4" height="6" fill={hairColor} />
                    <rect x="44" y="14" width="4" height="6" fill={hairColor} />
                  </>
                )}
                {isBack && <rect x="14" y="14" width="36" height="20" fill={hairColor} />}
                <rect x="18" y="4" width="1" height="4" fill="#fbbf24" />
                <rect x="22" y="2" width="1" height="4" fill="#fef08a" />
                <rect x="34" y="2" width="1" height="4" fill="#fef08a" />
                <rect x="44" y="4" width="1" height="4" fill="#fbbf24" />
                <rect x="48" y="2" width="1" height="4" fill="#fbbf24" />
              </g>
            )}

            {hairKind === 'silver_wave' && (
              <g>
                <rect x="10" y="8" width="44" height="7" fill={hairColor} />
                <rect x="12" y="6" width="40" height="2" fill={hairColor} />
                {showLongHairFront ? (
                  <>
                    <rect x="8" y="15" width="5" height="24" fill={hairColor} />
                    <rect x="51" y="15" width="5" height="24" fill={hairColor} />
                    <rect x="6" y="20" width="3" height="16" fill={hairColor} />
                    <rect x="55" y="20" width="3" height="16" fill={hairColor} />
                    <rect x="12" y="36" width="4" height="5" fill={hairColor} />
                    <rect x="48" y="36" width="4" height="5" fill={hairColor} />
                    <rect x="16" y="15" width="6" height="5" fill={hairColor} />
                    <rect x="42" y="15" width="6" height="5" fill={hairColor} />
                  </>
                ) : (
                  <rect x="6" y="15" width="52" height="30" fill={hairColor} />
                )}
                <rect x="18" y="9" width="28" height="1" fill="#fff" opacity="0.55" />
                <rect x="10" y="20" width="1" height="16" fill="#fff" opacity="0.3" />
                <rect x="53" y="20" width="1" height="16" fill="#fff" opacity="0.3" />
              </g>
            )}

            {/* === GLASSES === */}
            {glassesKind !== 'none' && showFace && !isSide && (
              <g>
                {glassesKind === 'star' ? (
                  <g>
                    <path d="M23 18 L24 20 L26 20 L24.5 21.5 L25 23.5 L23 22 L21 23.5 L21.5 21.5 L20 20 L22 20 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
                    <path d="M39 18 L40 20 L42 20 L40.5 21.5 L41 23.5 L39 23 L37 23.5 L37.5 21.5 L36 20 L38 20 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
                  </g>
                ) : (
                  <g fill="none" stroke={glassesColor} strokeWidth="0.7">
                    <rect x="19" y="18" width="9" height="7" />
                    <rect x="36" y="18" width="9" height="7" />
                    <line x1="28" y1="21" x2="36" y2="21" />
                    <rect x="20" y="19" width="3" height="1" fill="#fff" opacity="0.4" stroke="none" />
                    <rect x="37" y="19" width="3" height="1" fill="#fff" opacity="0.4" stroke="none" />
                  </g>
                )}
              </g>
            )}
            {glassesKind !== 'none' && showFace && isSide && glassesKind !== 'star' && (
              <g fill="none" stroke={glassesColor} strokeWidth="0.7">
                <rect x="37" y="18" width="8" height="7" />
                <rect x="36" y="21" width="2" height="0.5" />
              </g>
            )}

            {/* === HAT === */}
            {hatKind === 'bandana' && (
              <g>
                <rect x="12" y="12" width="40" height="5" fill="#ef4444" />
                <rect x="12" y="12" width="40" height="1" fill="#7f1d1d" opacity="0.7" />
                <rect x="16" y="13" width="5" height="3" fill="#fca5a5" opacity="0.7" />
                {!isBack && (
                  <g>
                    <rect x="48" y="13" width="5" height="4" fill="#ef4444" />
                    <rect x="50" y="16" width="4" height="3" fill="#ef4444" />
                    <rect x="50" y="12" width="4" height="3" fill="#ef4444" />
                  </g>
                )}
              </g>
            )}

            {hatKind === 'wizard' && (
              <g>
                <path d="M12 14 L32 -6 L52 14 Z" fill="#4c1d95" />
                <rect x="10" y="13" width="44" height="3" fill="#4c1d95" />
                <rect x="10" y="12" width="44" height="1" fill="#1e1b4b" />
                <rect x="10" y="15" width="44" height="1" fill="#1e1b4b" opacity="0.6" />
                <path d="M32 -6 L52 14 L48 14 L32 0 Z" fill="#1e1b4b" opacity="0.5" />
                <path d="M20 4 L21 6 L23 6 L21.5 7.5 L22 9 L20 8 L18 9 L18.5 7.5 L17 6 L19 6 Z" fill="#fde047" stroke="#f59e0b" strokeWidth="0.3" />
              </g>
            )}

            {hatKind === 'crown' && (
              <g>
                <rect x="16" y="4" width="32" height="4" fill="#fbbf24" />
                <path d="M16 4 L18 -2 L22 4 Z" fill="#fbbf24" />
                <path d="M26 4 L32 -5 L38 4 Z" fill="#fbbf24" />
                <path d="M42 4 L46 -2 L48 4 Z" fill="#fbbf24" />
                <rect x="30" y="0" width="4" height="3" fill="#ef4444" />
                <rect x="19" y="1" width="2" height="2" fill="#22d3ee" />
                <rect x="43" y="1" width="2" height="2" fill="#22d3ee" />
                <rect x="18" y="5" width="6" height="1" fill="#fef3c7" opacity="0.8" />
                <rect x="40" y="5" width="6" height="1" fill="#fef3c7" opacity="0.8" />
                <rect x="16" y="7" width="32" height="1" fill="#92400e" opacity="0.6" />
              </g>
            )}

            {hatKind === 'conqueror' && (
              <g>
                <rect x="8" y="12" width="48" height="3" fill="#0f172a" />
                <rect x="8" y="13" width="48" height="1" fill="#000" opacity="0.5" />
                <rect x="16" y="3" width="32" height="10" fill="#0f172a" />
                <rect x="16" y="3" width="32" height="1" fill="#1f2937" />
                <rect x="16" y="8" width="32" height="2" fill="#7c2d12" />
                <path d="M40 3 L46 -4 L48 2 L43 6 Z" fill="#dc2626" />
                <path d="M44 -4 L46 -2" stroke="#7f1d1d" strokeWidth="0.4" />
              </g>
            )}

            {/* === AURA === */}
            {auraKind === 'glow' && (
              <g opacity="0.55">
                <rect x="10" y="4" width="44" height="68" fill="none" stroke="#22d3ee" strokeWidth="0.4" />
                <rect x="8" y="2" width="48" height="72" fill="none" stroke="#67e8f9" strokeWidth="0.3" opacity="0.6" />
              </g>
            )}
            {auraKind === 'fire' && (
              <g>
                <path d="M12 70 L14 64 L16 70 L18 62 L20 70 L22 60 L24 70 L26 62 L28 70 L30 60 L32 70 L34 62 L36 70 L38 60 L40 70 L42 62 L44 70 L46 64 L48 70 L50 62 L52 70 Z" fill="#f97316" opacity="0.7" />
                <path d="M14 70 L16 66 L18 70 L20 64 L22 70 L24 64 L26 70 L28 64 L30 70 L32 64 L34 70 L36 64 L38 70 L40 64 L42 70 L44 64 L46 70 L48 66 L50 70 Z" fill="#fbbf24" opacity="0.8" />
              </g>
            )}
            </g>
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
