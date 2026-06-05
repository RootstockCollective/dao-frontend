import type { Hex } from 'viem'

import { buildGaugeEventsResponse } from '../_lib/fetch-gauge-events'

// keccak256('NotifyReward(address,uint256,uint256)')
const NOTIFY_REWARD_TOPIC: Hex = '0x3c0f5c48b0ffa2c570c1a0f4fbf7b0f8982213afff9eb42cd258ead865cf3c9d'

const ROUTE = '/api/gauges/notify-reward'

export const revalidate = 25

export async function GET(req: Request) {
  return buildGaugeEventsResponse(req, NOTIFY_REWARD_TOPIC, ROUTE)
}
