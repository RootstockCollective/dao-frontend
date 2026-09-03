import type { Hex } from 'viem'

import { buildGaugeEventsResponse } from '../_lib/fetch-gauge-events'

// keccak256('BackerRewardsClaimed(address,address,uint256)')
const BACKER_REWARDS_CLAIMED_TOPIC: Hex = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'

const ROUTE = '/api/gauges/backer-rewards-claimed'

export const revalidate = 25

export async function GET(req: Request) {
  return buildGaugeEventsResponse(req, BACKER_REWARDS_CLAIMED_TOPIC, ROUTE)
}
