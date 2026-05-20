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
    novice: '#854d0e', // Beautiful warm brown hair/outfit base
    spiky: '#3b82f6', // Bright royal blue
    elegant: '#a855f7', // Mystic purple
    flaming: '#ea580c', // Fire orange
    silver_wave: '#94a3b8', // Silver slate
    bandana: '#ef4444',
    wizard: '#6366f1',
    crown: '#eab308',
    conqueror: '#1e293b',
    round: '#f1f5f9',
    scholar: '#06b6d4',
    star: '#eab308',
    crystal: '#d8b4fe',
    cardigan: '#10b981',
    sailor: '#0284c7',
    royal: '#7c3aed',
    aurora: '#06b6d4',
    school: '#475569',
    adventurer: '#78350f',
    canvas: '#f8fafc',
    wing: '#60a5fa',
    moon: '#a78bfa',
    satchel: '#854d0e',
    cape: '#dc2626',
    wings: '#fef08a',
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
  const squeeze = isSide ? 'translate(32 40) scale(0.9 1) translate(-32 -40)' : undefined

  // Theme colors matching the equipment palette
  const topColor = palette(codes.top, '#475569')
  const bottomColor = palette(codes.bottom, '#1e293b')
  const hairColor = palette(codes.hair, '#7c2d12')
  const shoesColor = palette(codes.shoes, '#334155')
  const skinBase = '#fde0c0'
  const skinShade = '#f4a87a'
  const skinOutline = '#c2410c'

  const topShade = shade(topColor, -35)
  const topLight = shade(topColor, 25)
  const bottomShade = shade(bottomColor, -35)
  const hairShade = shade(hairColor, -40)
  const hairLight = shade(hairColor, 35)
  const shoesShade = shade(shoesColor, -40)

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

  const auraBgs: Record<string, string> = {
    glow: 'bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.25),transparent_50%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]',
    fire: 'bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.25),transparent_50%),linear-gradient(180deg,rgba(20,10,5,0.99),rgba(2,4,12,0.99))]',
    rainbow: 'bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.25),transparent_55%),linear-gradient(180deg,rgba(10,10,32,0.99),rgba(2,2,8,0.99))]',
  }
  const containerBg = auraBgs[auraKind] || 'bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.2),transparent_50%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]'

  return (
    <div className={`relative flex aspect-[5/6] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 ${containerBg}`}>
      {/* Background visual aura glow animations */}
      {auraKind === 'glow' && <div className="absolute h-56 w-56 rounded-full bg-cyan-400/20 blur-2xl animate-pulse" />}
      {auraKind === 'fire' && <div className="absolute bottom-12 h-64 w-48 rounded-full bg-orange-500/25 blur-3xl animate-pulse" />}
      {auraKind === 'rainbow' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          className="absolute h-64 w-64 rounded-full border border-dashed border-amber-300/30 bg-[conic-gradient(from_180deg,rgba(244,114,182,.2),rgba(34,211,238,.18),rgba(250,204,21,.18),rgba(167,139,250,.2),rgba(244,114,182,.2))] blur-[1px]"
        />
      )}

      <svg
        viewBox="0 0 64 80"
        className="relative z-10 h-[94%] w-[94%] drop-shadow-2xl"
        role="img"
        aria-label={`ตัวละคร ${directionLabels[direction]}`}
      >
        <defs>
          <style>{`
            @keyframes animeBreathe {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-1.2px); }
            }
          `}</style>

          {/* Dynamic Linear Gradients for Anime aesthetic */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skinBase} />
            <stop offset="100%" stopColor={skinShade} />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hairLight} />
            <stop offset="60%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairShade} />
          </linearGradient>
          <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={topLight} />
            <stop offset="100%" stopColor={topColor} />
          </linearGradient>
          <linearGradient id="bottomGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bottomColor} />
            <stop offset="100%" stopColor={bottomShade} />
          </linearGradient>
          <linearGradient id="shoesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shoesColor} />
            <stop offset="100%" stopColor={shoesShade} />
          </linearGradient>

          {/* Special Flame Gradient */}
          <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="80%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>

        <g transform={sideFlip}>
          <g transform={squeeze}>
            <motion.g
              key={direction}
              initial={{ scaleX: 0.85, scaleY: 1.1, opacity: 0.9 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              style={{ transformOrigin: '32px 40px' }}
            >
              <g style={{ animation: 'animeBreathe 2.5s ease-in-out infinite' }}>
                {/* Showcase Podium Platform */}
                <g opacity="0.85">
                  <ellipse cx="32" cy="74.5" rx="16" ry="3.5" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                  <ellipse cx="32" cy="74.5" rx="16" ry="3.5" fill="none" stroke="#0ea5e9" strokeWidth="0.3" strokeDasharray="3 1.5" />
                  <ellipse cx="32" cy="75.5" rx="13" ry="2.8" fill="#0c4a6e" stroke="#0284c7" strokeWidth="0.5" />
                  <ellipse cx="32" cy="73.8" rx="13" ry="2.8" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                </g>
                {/* Floor shadow */}
                <ellipse cx="32" cy="73.8" rx="9" ry="1.5" fill="#000" opacity="0.45" />

                {/* === BACK ACCESSORIES (behind body) === */}
                {backKind === 'cape' && (
                  <g>
                    <path d="M 23 34 Q 15 48, 12 70 Q 32 75, 52 70 Q 49 48, 41 34 Z" fill="url(#flameGrad)" opacity="0.9" />
                    <path d="M 23 34 Q 15 48, 12 70" fill="none" stroke="#7f1d1d" strokeWidth="0.5" />
                    <path d="M 41 34 Q 49 48, 52 70" fill="none" stroke="#7f1d1d" strokeWidth="0.5" />
                  </g>
                )}
                {backKind === 'wings' && (
                  <g>
                    {/* Left Wing */}
                    <path d="M 22 36 C 14 26, 4 30, 4 42 C 4 50, 14 50, 22 44 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <path d="M 20 38 Q 10 32, 6 42 Q 12 44, 20 42" fill="none" stroke="#ca8a04" strokeWidth="0.4" opacity="0.7" />
                    {/* Right Wing */}
                    <path d="M 42 36 C 50 26, 60 30, 60 42 C 60 50, 50 50, 42 44 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <path d="M 44 38 Q 54 32, 58 42 Q 52 44, 44 42" fill="none" stroke="#ca8a04" strokeWidth="0.4" opacity="0.7" />
                  </g>
                )}
                {backKind === 'satchel' && !isBack && (
                  <g>
                    {/* Sling strap across shoulder */}
                    <path d="M 23 34 L 38 48" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Cute leather bag */}
                    <rect x="36" y="44" width="8" height="8" rx="2" fill="#a16207" stroke="#78350f" strokeWidth="0.6" />
                    <path d="M 36 46 H 44" stroke="#78350f" strokeWidth="0.5" />
                    <circle cx="40" cy="49" r="0.8" fill="#fbbf24" />
                  </g>
                )}

                {/* === LEGS === */}
                {!isSide ? (
                  <g>
                    {/* Left leg */}
                    <rect x="23" y="47.5" width="6" height="9" rx="2.5" fill="url(#bottomGrad)" stroke={shade(bottomColor, -30)} strokeWidth="0.4" />
                    {/* Right leg */}
                    <rect x="35" y="47.5" width="6" height="9" rx="2.5" fill="url(#bottomGrad)" stroke={shade(bottomColor, -30)} strokeWidth="0.4" />
                  </g>
                ) : (
                  <g>
                    {/* Behind leg */}
                    <rect x="26.5" y="47.5" width="5.5" height="9" rx="2.5" fill="url(#bottomGrad)" opacity="0.75" />
                    {/* Front leg */}
                    <rect x="32" y="47.5" width="5.5" height="9" rx="2.5" fill="url(#bottomGrad)" stroke={shade(bottomColor, -30)} strokeWidth="0.4" />
                  </g>
                )}

                {/* === SHOES === */}
                {!isSide ? (
                  <g>
                    {/* Left shoe */}
                    <rect x="22" y="55.5" width="8" height="4.5" rx="2" fill="url(#shoesGrad)" stroke={shoesShade} strokeWidth="0.4" />
                    <line x1="24" y1="56.5" x2="28" y2="56.5" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                    {/* Right shoe */}
                    <rect x="34" y="55.5" width="8" height="4.5" rx="2" fill="url(#shoesGrad)" stroke={shoesShade} strokeWidth="0.4" />
                    <line x1="36" y1="56.5" x2="40" y2="56.5" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                  </g>
                ) : (
                  <g>
                    {/* Behind shoe */}
                    <rect x="25.5" y="55.5" width="7.5" height="4.5" rx="2" fill="url(#shoesGrad)" opacity="0.75" />
                    {/* Front shoe */}
                    <rect x="31" y="55.5" width="7.5" height="4.5" rx="2" fill="url(#shoesGrad)" stroke={shoesShade} strokeWidth="0.4" />
                    <line x1="32.5" y1="56.5" x2="36" y2="56.5" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
                  </g>
                )}

                {/* === BODY / TORSO === */}
                {!isSide ? (
                  <g>
                    <path d="M 22 34 L 42 34 C 44 42, 43 48, 32 48 C 21 48, 20 42, 22 34 Z" fill="url(#topGrad)" stroke={topShade} strokeWidth="0.4" />
                    {/* Sailor/uniform collar detail */}
                    <path d="M 28 34 L 32 38 L 36 34" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
                    {/* Gold badge */}
                    <circle cx="32" cy="41" r="1.2" fill="#f59e0b" />
                  </g>
                ) : (
                  <g>
                    <path d="M 25 34 L 37 34 C 39 42, 38 48, 31 48 C 24 48, 23 42, 25 34 Z" fill="url(#topGrad)" stroke={topShade} strokeWidth="0.4" />
                  </g>
                )}

                {/* === ARMS & HANDS === */}
                {!isSide ? (
                  <g>
                    {/* Left arm */}
                    <path d="M 22 34 C 18 35, 16 41, 17 44 Q 18.5 45, 20.5 43 L 22 34 Z" fill="url(#topGrad)" stroke={topShade} strokeWidth="0.4" />
                    <circle cx="17.5" cy="44.5" r="2" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.3" />
                    {/* Right arm */}
                    <path d="M 42 34 C 46 35, 48 41, 47 44 Q 45.5 45, 43.5 43 L 42 34 Z" fill="url(#topGrad)" stroke={topShade} strokeWidth="0.4" />
                    <circle cx="46.5" cy="44.5" r="2" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.3" />
                  </g>
                ) : (
                  <g>
                    {/* Back arm */}
                    <path d="M 27 34 C 24 35, 22 41, 23 44" fill="none" stroke="url(#topGrad)" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                    <circle cx="23" cy="44.5" r="1.8" fill="url(#skinGrad)" opacity="0.6" />
                    {/* Front arm */}
                    <path d="M 33 34 C 37 36, 39 41, 38 44 Q 36.5 45, 34.5 43 L 33 34 Z" fill="url(#topGrad)" stroke={topShade} strokeWidth="0.4" />
                    <circle cx="37" cy="44.5" r="2" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.3" />
                  </g>
                )}

                {/* === NECK === */}
                <rect x="29" y="31.5" width="6" height="3" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.3" />

                {/* === HEAD === */}
                {!isSide ? (
                  <path d="M 16 14 C 16 6, 48 6, 48 14 C 48 24, 44 32, 32 32 C 20 32, 16 24, 16 14 Z" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.4" />
                ) : (
                  <path d="M 18 14 C 18 6, 46 6, 46 14 C 46 22, 44 31, 33 32 Q 30 32 28 30 C 20 28, 18 22, 18 14 Z" fill="url(#skinGrad)" stroke={skinOutline} strokeWidth="0.4" />
                )}

                {/* === FACE (Big Anime Eyes, Blush, Smile) === */}
                {showFace && (
                  <g>
                    {!isSide ? (
                      <>
                        {/* Eyes */}
                        {/* Left Eye */}
                        <ellipse cx="23.5" cy="21.5" rx="3.2" ry="4" fill="#ffffff" />
                        <ellipse cx="23.5" cy="21.5" rx="2.2" ry="3.5" fill={hairColor} />
                        <path d="M 21.3 21.5 A 2.2 3.5 0 0 1 25.7 21.5 Z" fill="#000000" opacity="0.3" />
                        <ellipse cx="23.5" cy="21.8" rx="1.1" ry="1.8" fill="#1e293b" />
                        <circle cx="22.5" cy="19.8" r="0.8" fill="#ffffff" />
                        <circle cx="24.5" cy="23.2" r="0.4" fill="#ffffff" />
                        <path d="M 19.5 20 Q 23.5 17 27.5 20" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M 21.5 25 Q 23.5 25.8 25.5 25" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.8" />

                        {/* Right Eye */}
                        <ellipse cx="40.5" cy="21.5" rx="3.2" ry="4" fill="#ffffff" />
                        <ellipse cx="40.5" cy="21.5" rx="2.2" ry="3.5" fill={hairColor} />
                        <path d="M 38.3 21.5 A 2.2 3.5 0 0 1 42.7 21.5 Z" fill="#000000" opacity="0.3" />
                        <ellipse cx="40.5" cy="21.8" rx="1.1" ry="1.8" fill="#1e293b" />
                        <circle cx="39.5" cy="19.8" r="0.8" fill="#ffffff" />
                        <circle cx="41.5" cy="23.2" r="0.4" fill="#ffffff" />
                        <path d="M 36.5 20 Q 40.5 17 44.5 20" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M 38.5 25 Q 40.5 25.8 42.5 25" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.8" />

                        {/* Eyebrows */}
                        <path d="M 20 15.5 Q 23.5 14.5 26.5 15.5" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 37.5 15.5 Q 41 14.5 44 15.5" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />

                        {/* Blush */}
                        <ellipse cx="20.5" cy="26" rx="3" ry="1.2" fill="#fca5a5" opacity="0.6" />
                        <ellipse cx="43.5" cy="26" rx="3" ry="1.2" fill="#fca5a5" opacity="0.6" />

                        {/* Mouth */}
                        <path d="M 30.5 27.2 Q 32 29 33.5 27.2" fill="none" stroke={skinOutline} strokeWidth="1" strokeLinecap="round" />
                        
                        {/* Tiny Nose */}
                        <path d="M 32 24.5 L 32 25.5" stroke={skinOutline} strokeWidth="0.5" opacity="0.4" />
                      </>
                    ) : (
                      <>
                        {/* Side view eye */}
                        <ellipse cx="39" cy="21.5" rx="2.8" ry="4" fill="#ffffff" />
                        <ellipse cx="39.5" cy="21.5" rx="1.8" ry="3.5" fill={hairColor} />
                        <ellipse cx="39.8" cy="21.8" rx="0.9" ry="1.8" fill="#1e293b" />
                        <circle cx="38.8" cy="19.8" r="0.7" fill="#ffffff" />
                        <path d="M 35.5 20 Q 39.5 17 42 20" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M 37.5 15.5 Q 39.5 14.5 41.5 15.5" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
                        <ellipse cx="37" cy="26" rx="3.5" ry="1.2" fill="#fca5a5" opacity="0.6" />
                        <path d="M 40.5 27 Q 41.5 28 41 28.5" fill="none" stroke={skinOutline} strokeWidth="0.8" strokeLinecap="round" />
                      </>
                    )}
                  </g>
                )}

                {/* === HAIR STYLES === */}
                {/* Back hair layers (Front view) */}
                {showFace && !isSide && (
                  <g opacity="0.9">
                    {/* Back hair side flowing locks */}
                    {hairKind === 'novice' && (
                      <path d="M 14 14 Q 10 26, 12 36 Q 16 38, 18 14 Z M 50 14 Q 54 26, 52 36 Q 48 38, 46 14 Z" fill="url(#hairGrad)" />
                    )}
                    {hairKind === 'elegant' && (
                      <g>
                        {/* Flowing left twin-tail */}
                        <path d="M 12 12 Q 5 24, 7 46 Q 13 46, 14 12 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                        {/* Flowing right twin-tail */}
                        <path d="M 52 12 Q 59 24, 57 46 Q 51 46, 50 12 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                      </g>
                    )}
                    {hairKind === 'silver_wave' && (
                      <g>
                        {/* Left wavy tail */}
                        <path d="M 13 14 C 7 24, 9 40, 12 48 C 16 46, 15 32, 16 14 Z" fill="url(#hairGrad)" />
                        {/* Right wavy tail */}
                        <path d="M 51 14 C 57 24, 55 40, 52 48 C 48 46, 49 32, 48 14 Z" fill="url(#hairGrad)" />
                      </g>
                    )}
                  </g>
                )}

                {/* Front Hair Overlay / Bangs */}
                {!isBack ? (
                  <g>
                    {/* Dynamic Hair Highlights Overlay */}
                    {hairKind === 'novice' && (
                      <g>
                        <path d="M 14 12 C 14 4, 50 4, 50 12 C 45 16, 39 12, 32 16 C 25 12, 19 16, 14 12 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                        {/* Cut bangs paths */}
                        <path d="M 14 12 Q 18 18, 22 14" fill="none" stroke={hairShade} strokeWidth="0.5" />
                        <path d="M 42 14 Q 46 18, 50 12" fill="none" stroke={hairShade} strokeWidth="0.5" />
                        <path d="M 28 14 Q 32 18, 36 14" fill="none" stroke={hairShade} strokeWidth="0.5" />
                        {/* Glossy highlight line */}
                        <path d="M 20 8 Q 32 11 44 8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
                      </g>
                    )}

                    {hairKind === 'spiky' && (
                      <g>
                        <path d="M 12 15 C 10 9, 14 2, 17 5 C 19 2, 23 8, 24 10 C 26 5, 29 1, 32 4 C 35 1, 38 6, 39 9 C 41 4, 45 1, 47 5 C 49 2, 54 9, 52 15 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                        {/* Glossy highlights on tips */}
                        <path d="M 17 6 L 24 10 M 32 5 L 39 9 M 47 6 L 52 14" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                      </g>
                    )}

                    {hairKind === 'elegant' && (
                      <g>
                        <path d="M 14 12 C 14 4, 50 4, 50 12 C 43 14, 38 12, 32 15 C 26 12, 21 14, 14 12 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                        {/* Soft face framing strands */}
                        <path d="M 14 12 C 12 18, 14 25, 16 26 C 18 25, 17 18, 17 12 Z" fill="url(#hairGrad)" />
                        <path d="M 50 12 C 52 18, 50 25, 48 26 C 46 25, 47 18, 47 12 Z" fill="url(#hairGrad)" />
                        <path d="M 22 8 Q 32 11 42 8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.45" strokeLinecap="round" />
                      </g>
                    )}

                    {hairKind === 'flaming' && (
                      <g>
                        {/* Fiery animated spikes using Flame Gradient */}
                        <path d="M 12 15 C 9 6, 16 -3, 20 2 C 22 -3, 27 5, 28 8 C 30 2, 35 -4, 37 1 C 40 -2, 45 4, 46 8 C 48 2, 53 5, 52 15 Z" fill="url(#flameGrad)" stroke="#b91c1c" strokeWidth="0.4" />
                        <path d="M 16 15 Q 19 20, 22 17 Q 25 21, 28 17 Q 31 22, 35 18 Q 38 22, 42 18 Q 45 20, 48 15" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity="0.8" />
                      </g>
                    )}

                    {hairKind === 'silver_wave' && (
                      <g>
                        <path d="M 14 12 C 14 4, 50 4, 50 12 C 42 16, 38 13, 32 16 C 26 13, 22 16, 14 12 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                        {/* Wave curls overlay */}
                        <path d="M 14 12 Q 11 20, 15 24 Q 17 20, 16 12 Z" fill="url(#hairGrad)" />
                        <path d="M 50 12 Q 53 20, 49 24 Q 47 20, 48 12 Z" fill="url(#hairGrad)" />
                        <path d="M 22 8 Q 32 11 42 8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                ) : (
                  <g>
                    {/* Back view hair (Covers the whole back of the head) */}
                    <path d="M 14 14 C 14 4, 50 4, 50 14 C 50 30, 44 34, 32 34 C 20 34, 14 30, 14 14 Z" fill="url(#hairGrad)" stroke={hairShade} strokeWidth="0.4" />
                    {/* Back hair highlights */}
                    <path d="M 22 9 Q 32 12 42 9" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
                  </g>
                )}

                {/* === GLASSES === */}
                {glassesKind !== 'none' && showFace && !isSide && (
                  <g>
                    {glassesKind === 'star' ? (
                      <g>
                        {/* Left star */}
                        <path d="M 23.5 17.5 L 25 21 L 28.5 21 L 26 23 L 27 26.5 L 23.5 24.5 L 20 26.5 L 21 23 L 18.5 21 L 22 21 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.4" />
                        {/* Right star */}
                        <path d="M 40.5 17.5 L 42 21 L 45.5 21 L 43 23 L 44 26.5 L 40.5 24.5 L 37 26.5 L 38 23 L 35.5 21 L 39 21 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.4" />
                        {/* Connecting bridge */}
                        <path d="M 28.5 21 Q 32 20, 35.5 21" fill="none" stroke="#d97706" strokeWidth="0.6" />
                      </g>
                    ) : (
                      <g fill="none" stroke={glassesColor} strokeWidth="1">
                        {/* Sleek round or modern square glasses */}
                        <ellipse cx="23.5" cy="22" rx="5" ry="4.5" />
                        <ellipse cx="40.5" cy="22" rx="5" ry="4.5" />
                        <path d="M 28.5 22 Q 32 21, 35.5 22" />
                        {/* Shiny lens reflect effect */}
                        <path d="M 20 20 L 22 22" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
                        <path x2="37" y2="20" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
                      </g>
                    )}
                  </g>
                )}
                {glassesKind !== 'none' && showFace && isSide && glassesKind !== 'star' && (
                  <g fill="none" stroke={glassesColor} strokeWidth="1">
                    <ellipse cx="39.5" cy="22" rx="4.5" ry="4.5" />
                    <path d="M 35 21.5 L 36.5 22" />
                  </g>
                )}

                {/* === HATS === */}
                {hatKind === 'bandana' && (
                  <g>
                    {/* Curved styled bandana wrap */}
                    <path d="M 14 11.5 Q 32 8.5 50 11.5 L 49.5 15.5 Q 32 12.5 14.5 15.5 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="0.4" />
                    <path d="M 18 12.5 Q 32 9.5 46 12.5" fill="none" stroke="#fecaca" strokeWidth="0.5" opacity="0.6" />
                    {!isBack && (
                      <g>
                        {/* Knot detail on the side */}
                        <path d="M 48 13 C 51 11, 53 14, 50 17 C 49 18, 48 16, 48 13 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="0.4" />
                      </g>
                    )}
                  </g>
                )}

                {hatKind === 'wizard' && (
                  <g>
                    {/* Curved wizard hat with slightly bent tip */}
                    <path d="M 13 13 C 18 3, 25 -5, 32 -7 C 36 -6, 41 3, 47 13 Z" fill="#4338ca" stroke="#1e1b4b" strokeWidth="0.4" />
                    {/* Shiny hat band */}
                    <path d="M 13 13 Q 32 10.5 47 13 L 46 15 Q 32 12.5 14 15 Z" fill="#eab308" />
                    {/* Big gold crescent buckle */}
                    <circle cx="30" cy="11.5" r="2.5" fill="none" stroke="#eab308" strokeWidth="0.8" />
                    {/* Brim */}
                    <ellipse cx="30" cy="14" rx="20" ry="2.2" fill="#312e81" stroke="#1e1b4b" strokeWidth="0.4" />
                  </g>
                )}

                {hatKind === 'crown' && (
                  <g>
                    {/* Majestic anime-style crown */}
                    <path d="M 18 8 L 22 1 L 27 5.5 L 32 -1.5 L 37 5.5 L 42 1 L 46 8 Z" fill="#eab308" stroke="#854d0e" strokeWidth="0.4" />
                    {/* Rubies & Sapphire gems details */}
                    <circle cx="22" cy="1" r="0.7" fill="#ef4444" />
                    <circle cx="32" cy="-1.5" r="0.8" fill="#3b82f6" />
                    <circle cx="42" cy="1" r="0.7" fill="#ef4444" />
                    {/* Crown rim highlights */}
                    <path d="M 19.5 7 H 44.5" stroke="#fef08a" strokeWidth="0.5" />
                  </g>
                )}

                {hatKind === 'conqueror' && (
                  <g>
                    {/* Stylish military cap */}
                    <path d="M 16 13 L 48 13 L 46 6.5 L 18 6.5 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.4" />
                    <path d="M 14 13.5 Q 32 16.5 50 13.5 L 49.5 15 Q 32 18 14.5 15 Z" fill="#0f172a" />
                    {/* Red badge */}
                    <circle cx="32" cy="9.5" r="1.5" fill="#ef4444" />
                    {/* Gold trim */}
                    <path d="M 18 11.5 Q 32 13.5 46 11.5" stroke="#eab308" strokeWidth="0.5" fill="none" />
                  </g>
                )}

                {/* === AURA OVERLAYS === */}
                {auraKind === 'glow' && (
                  <g opacity="0.6">
                    <rect x="8" y="2" width="48" height="72" rx="8" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 2" />
                  </g>
                )}
                {auraKind === 'fire' && (
                  <g opacity="0.7">
                    {/* Rising fire sparks */}
                    <path d="M 12 70 Q 15 62, 17 65 T 22 55 T 27 68 T 32 50 T 37 68 T 42 55 T 47 65 T 52 70" fill="none" stroke="#f97316" strokeWidth="0.8" />
                    <path d="M 16 70 Q 19 64, 21 66 T 26 58 T 31 69 T 36 53 T 41 69 T 46 58 T 48 70" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
                  </g>
                )}
              </g>
            </motion.g>
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
