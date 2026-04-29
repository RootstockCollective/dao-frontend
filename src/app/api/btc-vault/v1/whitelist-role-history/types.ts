import type { z } from 'zod'

import { BtcVaultWhitelistedUsersSortFieldEnum } from '../schemas'

export type BtcVaultWhitelistedUsersSortField = z.infer<typeof BtcVaultWhitelistedUsersSortFieldEnum>

/** One row of current whitelist state (state-sync or subgraph). */
export interface BtcVaultWhitelistedUserItem {
  id: string
  account: string
  lastUpdated: number
  status: string
}

export interface BtcVaultWhitelistedUsersPageResult {
  data: BtcVaultWhitelistedUserItem[]
  total: number
}
