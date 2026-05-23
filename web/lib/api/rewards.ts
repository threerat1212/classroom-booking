import { apiFetch } from '@/lib/http/client'

export type RewardCategory = 'learning_boost' | 'recognition' | 'privilege'
export type RedemptionStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'used'

export interface RewardItem {
  id: string
  code: string
  name: string
  description: string
  category: RewardCategory
  reward_type: string
  icon: string
  price_gold: number
  required_level: number
  stock_limit?: number
  weekly_limit?: number
  max_per_user?: number
  requires_approval: boolean
  is_active: boolean
  redeemed_count: number
  redeemed_this_week: number
  total_redemptions: number
  is_unlocked: boolean
  can_redeem: boolean
  blocked_reason?: string
}

export interface RewardRedemption {
  id: string
  reward_id: string
  user_id: string
  reward_code: string
  reward_name: string
  reward_category: RewardCategory
  student_name?: string
  student_email?: string
  gold_spent: number
  status: RedemptionStatus
  note?: string
  requested_at: string
  resolved_at?: string
  resolved_by?: string
}

export interface RewardShopSummary {
  gold_balance: number
  level: number
  rewards: RewardItem[]
  history: RewardRedemption[]
}

export function getRewardShop() {
  return apiFetch<{ data: RewardShopSummary }>('/api/v1/rewards')
}

export function redeemReward(rewardCode: string) {
  return apiFetch<{ data: { gold_balance: number; redemption: RewardRedemption } }>('/api/v1/rewards/redeem', {
    method: 'POST',
    body: JSON.stringify({ reward_code: rewardCode }),
  })
}

export function listRewardRedemptions(status?: RedemptionStatus) {
  const query = status ? `?status=${status}` : ''
  return apiFetch<{ data: RewardRedemption[] }>(`/api/v1/rewards/redemptions${query}`)
}

export function updateRewardRedemption(id: string, input: { status: RedemptionStatus; note?: string }) {
  return apiFetch<{ data: RewardRedemption }>(`/api/v1/rewards/redemptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
