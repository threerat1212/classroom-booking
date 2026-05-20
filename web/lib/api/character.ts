import { apiFetch } from '@/lib/http/client'

export interface CharacterItem {
  code: string
  name: string
  category: 'hair' | 'hat' | 'outfit' | 'aura'
  sprite_url: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  required_level: number
  required_title_code?: string
  is_unlocked: boolean
}

export interface UserCharacter {
  user_id: string
  equipped_hair?: string
  equipped_hat?: string
  equipped_outfit?: string
  equipped_aura?: string
  updated_at: string
}

export interface CharacterSummary {
  character: UserCharacter
  inventory: CharacterItem[]
}

export function getCharacterSummary() {
  return apiFetch<{ data: CharacterSummary }>('/api/v1/character')
}

export function equipCharacterItem(itemCode: string) {
  return apiFetch<{ data: { character: UserCharacter } }>('/api/v1/character/equip', {
    method: 'POST',
    body: JSON.stringify({ item_code: itemCode }),
  })
}
