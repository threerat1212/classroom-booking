import { apiFetch } from '@/lib/http/client'

export type CharacterSlot =
  | 'hair'
  | 'hat'
  | 'glasses'
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'back'
  | 'outfit'
  | 'aura'

export interface CharacterItem {
  code: string
  name: string
  category: CharacterSlot
  sprite_url: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  required_level: number
  required_title_code?: string
  price_gold: number
  is_shop_item: boolean
  is_owned: boolean
  is_level_unlocked: boolean
  can_purchase: boolean
  is_unlocked: boolean
}

export interface UserCharacter {
  user_id: string
  equipped_hair?: string
  equipped_hat?: string
  equipped_outfit?: string
  equipped_aura?: string
  equipped_items?: Partial<Record<CharacterSlot, string>>
  updated_at: string
}

export interface CharacterSummary {
  character: UserCharacter
  inventory: CharacterItem[]
  gold_balance: number
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

export function purchaseCharacterItem(itemCode: string) {
  return apiFetch<{ data: { character: UserCharacter; gold_balance: number; item: CharacterItem } }>(
    '/api/v1/character/purchase',
    {
      method: 'POST',
      body: JSON.stringify({ item_code: itemCode }),
    },
  )
}
