import type { Hex } from 'viem'

import { buildGaugeEventsResponse } from '../_lib/fetch-gauge-events'

// keccak256('BuilderRewardsClaimed(address,address,uint256)')
const BUILDER_REWARDS_CLAIMED_TOPIC: Hex =
  '0xc309438e69ba53ef6afef64839bd1ab1acc4a9a8fd28c8e0356075ca66f72c1b'

const ROUTE = '/api/gauges/builder-rewards-claimed'

export const revalidate = 25

export async function GET(req: Request) {
  return buildGaugeEventsResponse(req, BUILDER_REWARDS_CLAIMED_TOPIC, ROUTE)
}
