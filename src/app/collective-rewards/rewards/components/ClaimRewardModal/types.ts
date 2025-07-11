import { getTokens } from '@/lib/tokens'

const tokens = getTokens()
const tokenKeys = Object.keys(tokens) as Array<keyof typeof tokens>

export type ClaimRewardType = 'all' | (typeof tokenKeys)[number]
