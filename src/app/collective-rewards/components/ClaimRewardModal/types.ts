import { TOKENS } from '@/lib/tokens'

const tokenKeys = Object.keys(TOKENS) as Array<keyof typeof TOKENS>

export type ClaimRewardType = 'all' | (typeof tokenKeys)[number]
