'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCharacterSummary, equipCharacterItem, CharacterItem, UserCharacter } from '@/lib/api/character'
import { Sparkles, Trophy, Zap, Shield, HelpCircle, Star, Award, CheckCircle, Lock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// ----------------------------------------------------
// Vector Layer Rendering for Character Sprite
// ----------------------------------------------------
interface SpriteProps {
  hair?: string
  hat?: string
  outfit?: string
  aura?: string
  scale?: number
}

function CharacterSprite({ hair = 'hair_novice', hat = 'hat_none', outfit = 'outfit_novice', aura = 'aura_none', scale = 1 }: SpriteProps) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 border border-white/5"
      style={{
        width: `${scale * 160}px`,
        height: `${scale * 180}px`,
      }}
    >
      {/* 1. Aura Layer (Backmost) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {aura === 'aura_glow' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-cyan-500/20 blur-xl"
          />
        )}
        {aura === 'aura_fire' && (
          <motion.div
            animate={{ y: [0, -5, 0], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full bg-gradient-to-t from-orange-500/35 via-red-500/10 to-transparent blur-lg"
          />
        )}
        {aura === 'aura_rainbow' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-violet-500/10 blur-md border border-dashed border-violet-500/20"
          />
        )}
      </div>

      {/* SVG Canvas for Character Layers */}
      <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 z-10 select-none">
        <defs>
          {/* Hair Gradients */}
          <linearGradient id="hair-novice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="hair-spiky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="hair-elegant" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          <linearGradient id="hair-flaming" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Outfit Gradients */}
          <linearGradient id="outfit-novice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#52525b" />
          </linearGradient>
          <linearGradient id="outfit-apprentice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="outfit-wizard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="outfit-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="outfit-god" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* 2. Character Base Body (Skin) */}
        {/* Face */}
        <rect x="35" y="32" width="30" height="26" rx="8" fill="#fed7aa" />
        {/* Neck */}
        <rect x="46" y="55" width="8" height="8" fill="#fdba74" />
        {/* Left Eye */}
        <circle cx="43" cy="44" r="2" fill="#1e293b" />
        {/* Right Eye */}
        <circle cx="57" cy="44" r="2" fill="#1e293b" />
        {/* Smile */}
        <path d="M 46 49 Q 50 53 54 49" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="40" cy="47" r="1.5" fill="#fca5a5" opacity="0.6" />
        <circle cx="60" cy="47" r="1.5" fill="#fca5a5" opacity="0.6" />

        {/* 3. Hair Layer */}
        {hair === 'hair_novice' && (
          // Swept Hair
          <path d="M 32 34 C 32 20, 68 20, 68 34 C 68 34, 70 30, 64 26 C 58 22, 42 22, 36 26 Z" fill="url(#hair-novice)" />
        )}
        {hair === 'hair_spiky' && (
          // Spiky Anime Hair
          <path d="M 31 35 L 26 26 L 36 28 L 42 16 L 50 24 L 58 16 L 64 28 L 74 26 L 69 35 Z" fill="url(#hair-spiky)" />
        )}
        {hair === 'hair_elegant' && (
          // Braids and Side-bangs
          <g>
            <path d="M 33 34 C 33 22, 67 22, 67 34 C 67 34, 60 25, 50 25 C 40 25, 33 34, 33 34 Z" fill="url(#hair-elegant)" />
            {/* Left Ponytail */}
            <path d="M 34 35 Q 26 40 28 52" stroke="url(#hair-elegant)" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Right Ponytail */}
            <path d="M 66 35 Q 74 40 72 52" stroke="url(#hair-elegant)" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        )}
        {hair === 'hair_flaming' && (
          // Rising Flames Hair
          <path d="M 32 35 C 28 25, 34 14, 40 18 C 43 12, 48 8, 52 14 C 58 10, 64 18, 68 22 C 72 26, 68 36, 68 36 Z" fill="url(#hair-flaming)" />
        )}

        {/* 4. Outfit Layer */}
        {outfit === 'outfit_novice' && (
          // Tunic
          <g>
            <path d="M 32 60 L 68 60 L 65 85 L 35 85 Z" fill="url(#outfit-novice)" />
            {/* Collar V-neck */}
            <path d="M 44 60 L 50 67 L 56 60" stroke="#fdba74" strokeWidth="2.5" fill="none" />
          </g>
        )}
        {outfit === 'outfit_apprentice' && (
          // Kimono
          <g>
            <path d="M 30 60 L 70 60 L 65 85 L 35 85 Z" fill="url(#outfit-apprentice)" />
            {/* Obi Belt */}
            <rect x="34" y="70" width="32" height="5" fill="#facc15" />
            <path d="M 42 60 L 50 70 L 58 60" stroke="#047857" strokeWidth="2" fill="none" />
          </g>
        )}
        {outfit === 'outfit_wizard' && (
          // Wizard Robe
          <g>
            <path d="M 28 60 L 72 60 L 66 85 L 34 85 Z" fill="url(#outfit-wizard)" />
            {/* Golden Star details */}
            <polygon points="50,68 52,72 56,72 53,75 54,79 50,77 46,79 47,75 44,72 48,72" fill="#fbbf24" />
          </g>
        )}
        {outfit === 'outfit_plate' && (
          // Steel Plate Armor
          <g>
            <path d="M 30 60 L 70 60 L 65 85 L 35 85 Z" fill="url(#outfit-plate)" />
            {/* Iron Shoulders */}
            <path d="M 26 60 Q 30 54 36 60 Z" fill="#94a3b8" />
            <path d="M 74 60 Q 70 54 64 60 Z" fill="#94a3b8" />
            {/* Emblem */}
            <rect x="46" y="66" width="8" height="10" fill="#dc2626" rx="2" />
          </g>
        )}
        {outfit === 'outfit_god' && (
          // Divine Armor with Golden Wings
          <g>
            {/* Back Golden Wings */}
            <path d="M 30 65 Q 14 55 18 42 Q 28 45 32 62 Z" fill="#fbbf24" opacity="0.8" />
            <path d="M 70 65 Q 86 55 82 42 Q 72 45 68 62 Z" fill="#fbbf24" opacity="0.8" />
            {/* Armor Body */}
            <path d="M 28 60 L 72 60 L 66 85 L 34 85 Z" fill="url(#outfit-god)" />
            <circle cx="50" cy="72" r="4" fill="#67e8f9" stroke="#fff" strokeWidth="1" />
          </g>
        )}

        {/* 5. Hat Layer (Topmost) */}
        {hat === 'hat_bandana' && (
          // Red Bandana
          <path d="M 32 32 H 68 V 37 H 32 Z" fill="#ef4444" />
        )}
        {hat === 'hat_wizard' && (
          // Wizard Pointy Hat
          <g>
            <path d="M 22 32 C 22 28, 78 28, 78 32 C 78 32, 60 10, 50 4 C 40 10, 22 32, 22 32 Z" fill="#312e81" />
            {/* Gold Trim */}
            <path d="M 22 32 C 22 30, 78 30, 78 32" stroke="#facc15" strokeWidth="2.5" fill="none" />
          </g>
        )}
        {hat === 'hat_crown' && (
          // Golden Royal Crown
          <path d="M 34 32 L 31 20 L 41 26 L 50 16 L 59 26 L 69 20 L 66 32 Z" fill="#facc15" stroke="#b45309" strokeWidth="1" />
        )}
        {hat === 'hat_conqueror' && (
          // Black Dragon Helm with glowing crimson horn
          <g>
            <path d="M 30 32 C 30 18, 70 18, 70 32 Z" fill="#1e293b" />
            <path d="M 46 20 L 50 6 L 54 20 Z" fill="#ef4444" />
            {/* Horn trim */}
            <rect x="34" y="27" width="32" height="5" fill="#334155" />
          </g>
        )}
      </svg>

      {/* Floating Sparkle Animation for Legendary Aura */}
      {aura === 'aura_rainbow' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce" />
          <div className="absolute top-1/2 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------
// Main Customize Page Component
// ----------------------------------------------------
export default function StudentCharacterPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'hair' | 'hat' | 'outfit' | 'aura'>('hair')

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <Skeleton className="h-80 md:col-span-4 bg-white/5 rounded-2xl" />
          <Skeleton className="h-80 md:col-span-8 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">
        ไม่สามารถดาวน์โหลดข้อมูลตัวละครได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
      </div>
    )
  }

  const { character, inventory } = summary
  const filteredItems = inventory.filter((item) => item.category === activeTab)

  const handleEquip = (itemCode: string) => {
    equipMutation.mutate(itemCode)
  }

  const tabs: { id: 'hair' | 'hat' | 'outfit' | 'aura'; label: string }[] = [
    { id: 'hair', label: 'ทรงผม (Hair)' },
    { id: 'hat', label: 'เครื่องหัว (Hat)' },
    { id: 'outfit', label: 'เครื่องแต่งกาย (Outfit)' },
    { id: 'aura', label: 'ออร่าเวทมนตร์ (Aura)' },
  ]

  const rarityColor = {
    common: 'text-slate-400 border-slate-700 bg-slate-800/40',
    rare: 'text-cyan-400 border-cyan-800 bg-cyan-950/20',
    epic: 'text-purple-400 border-purple-800 bg-purple-950/20',
    legendary: 'text-amber-400 border-amber-800 bg-amber-950/20',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          ห้องแต่งตัวตัวละครนักเรียน (Student Wardrobe)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          ปรับแต่งตัวละครพิกเซลสไตล์ของคุณ ขิงกับเพื่อนร่วมชั้น ปลดล็อกชุดพรีเมียมจากระดับเลเวลและฉายาพิเศษ!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Side: Avatar Preview Card */}
        <div className="md:col-span-4 flex flex-col items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="w-full text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">ตัวละครปัจจุบันของคุณ</h2>
            <p className="text-xs text-violet-400 mt-1">สไตล์ 2D Retro Layers</p>
          </div>

          <div className="my-6">
            <CharacterSprite
              hair={character.equipped_hair}
              hat={character.equipped_hat}
              outfit={character.equipped_outfit}
              aura={character.equipped_aura}
              scale={1.3}
            />
          </div>

          <div className="w-full space-y-2 rounded-xl bg-slate-950/40 p-4 border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">ทรงผม:</span>
              <span className="text-white font-medium">
                {inventory.find(i => i.code === character.equipped_hair)?.name || 'ผู้เริ่มต้น'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">เครื่องหัว:</span>
              <span className="text-white font-medium">
                {inventory.find(i => i.code === character.equipped_hat)?.name || 'ไม่มี'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">ชุด:</span>
              <span className="text-white font-medium">
                {inventory.find(i => i.code === character.equipped_outfit)?.name || 'ผู้เริ่มต้น'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">ออร่าเวทมนตร์:</span>
              <span className="text-white font-medium">
                {inventory.find(i => i.code === character.equipped_aura)?.name || 'ไม่มี'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Inventory Selector */}
        <div className="md:col-span-8 flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          {/* Tabs */}
          <div className="flex border-b border-white/10 pb-2 overflow-x-auto gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === t.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid Inventory */}
          <div className="mt-6 flex-1 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const isEquipped =
                  character.equipped_hair === item.code ||
                  character.equipped_hat === item.code ||
                  character.equipped_outfit === item.code ||
                  character.equipped_aura === item.code

                return (
                  <motion.div
                    layout
                    key={item.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                      isEquipped
                        ? 'border-violet-500 bg-violet-950/20'
                        : item.is_unlocked
                        ? 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                        : 'border-slate-800 bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div>
                      {/* Rarity & Status */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${rarityColor[item.rarity]}`}>
                          {item.rarity}
                        </span>
                        {isEquipped && (
                          <span className="flex items-center text-[9px] font-semibold text-violet-400 gap-0.5">
                            <CheckCircle className="h-3 w-3" />
                            ใส่ใช้งานอยู่
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="mt-3 text-xs font-bold text-white line-clamp-1">{item.name}</h3>

                      {/* Requirements */}
                      <div className="mt-2 space-y-1">
                        {item.required_level > 1 && (
                          <p className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Shield className="h-2.5 w-2.5" />
                            ต้องการเลเวล {item.required_level}
                          </p>
                        )}
                        {item.required_title_code && (
                          <p className="text-[9px] text-cyan-400 flex items-center gap-1">
                            <Award className="h-2.5 w-2.5" />
                            ฉายา: {item.required_title_code === 'first_expert_conqueror' ? 'ผู้พิชิต Expert' : 'มือแม่น 100%'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      {item.is_unlocked ? (
                        <button
                          onClick={() => handleEquip(item.code)}
                          disabled={isEquipped || equipMutation.isPending}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                            isEquipped
                              ? 'bg-violet-900/35 text-violet-400 cursor-default'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isEquipped ? 'สวมใส่อยู่' : 'สวมใส่ (Equip)'}
                        </button>
                      ) : (
                        <div className="w-full py-1.5 rounded-lg bg-slate-800/60 text-slate-500 text-[10px] font-bold flex items-center justify-center gap-1">
                          <Lock className="h-3 w-3" />
                          ยังไม่ปลดล็อก
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
