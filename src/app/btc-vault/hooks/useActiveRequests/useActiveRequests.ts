import { useMemo } from 'react'

import { RBTC } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { ClaimableInfo, VaultRequest } from '../../services/types'
import { toActiveRequestDisplay } from '../../services/ui/mappers'
import type { ActiveRequestDisplay } from '../../services/ui/types'

const ONE_BTC = 10n ** 18n
const now = Math.floor(Date.now() / 1000)

const MOCK_ACTIVE_REQUEST: VaultRequest = {
  id: 'req-deposit-pending',
  type: 'deposit',
  amount: ONE_BTC / 2n,
  status: 'pending',
  epochId: '1',
  batchRedeemId: null,
  timestamps: { created: now - 60 },
  txHashes: { submit: `0x${'d1'.padStart(64, '0')}` },
}

const MOCK_CLAIMABLE_INFO: ClaimableInfo | null = null

export function useActiveRequests(address: string | undefined): { data: ActiveRequestDisplay[] | undefined } {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const data = useMemo(
    () =>
      address ? [toActiveRequestDisplay(MOCK_ACTIVE_REQUEST, MOCK_CLAIMABLE_INFO, rbtcPrice)] : undefined,
    [address, rbtcPrice],
  )
  return { data }
}
