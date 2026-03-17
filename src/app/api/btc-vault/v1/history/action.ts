import { gql } from '@apollo/client'

import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { btcVaultClient } from '@/shared/components/ApolloClient'

export interface BtcVaultHistoryItem {
  id: string
  user: string
  action: string
  assets: string
  shares: string
  epochId: string
  timestamp: number
  blockNumber: string
  transactionHash: string
}

/** Display status for history rows (Open to claim / Claim pending from request status). */
export type BtcVaultHistoryDisplayStatus =
  | 'open_to_claim'
  | 'pending'
  | 'claim_pending'
  | 'successful'
  | 'cancelled'
  | 'rejected'

export interface BtcVaultHistoryItemWithStatus extends BtcVaultHistoryItem {
  /** Set for each row; from request status for *_REQUEST, derived from action for CLAIMED/CANCELLED. */
  displayStatus?: BtcVaultHistoryDisplayStatus
}

const BTC_VAULT_GLOBAL_HISTORY_QUERY = gql`
  query BtcVaultGlobalHistory(
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultHistory_orderBy!
    $orderDirection: OrderDirection!
    $actionFilter: [BtcVaultActionType!]!
  ) {
    btcVaultHistories(
      where: { action_in: $actionFilter }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      user
      action
      assets
      shares
      epochId
      timestamp
      blockNumber
      transactionHash
    }
  }
`

const BTC_VAULT_USER_HISTORY_QUERY = gql`
  query BtcVaultUserHistory(
    $user: Bytes!
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultHistory_orderBy!
    $orderDirection: OrderDirection!
    $actionFilter: [BtcVaultActionType!]!
  ) {
    btcVaultHistories(
      where: { user: $user, action_in: $actionFilter }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      user
      action
      assets
      shares
      epochId
      timestamp
      blockNumber
      transactionHash
    }
  }
`

const BTC_VAULT_HISTORY_COUNTER_QUERY = gql`
  query BtcVaultHistoryCounter($id: ID!) {
    btcVaultHistoryCounter(id: $id) {
      total
      depositRequests
      depositsClaimed
      depositsCancelled
      redeemRequests
      redeemsClaimed
      redeemsCancelled
    }
  }
`

const BTC_VAULT_DEPOSIT_REQUESTS_BY_IDS = gql`
  query BtcDepositRequestsByIds($ids: [ID!]!, $first: Int!) {
    btcDepositRequests(where: { id_in: $ids }, first: $first) {
      id
      status
    }
  }
`

const BTC_VAULT_REDEEM_REQUESTS_BY_IDS = gql`
  query BtcRedeemRequestsByIds($ids: [ID!]!, $first: Int!) {
    btcRedeemRequests(where: { id_in: $ids }, first: $first) {
      id
      status
    }
  }
`

const ACTION_TYPE_TO_COUNTER_FIELD: Record<string, string> = {
  DEPOSIT_REQUEST: 'depositRequests',
  DEPOSIT_CLAIMED: 'depositsClaimed',
  DEPOSIT_CANCELLED: 'depositsCancelled',
  REDEEM_REQUEST: 'redeemRequests',
  REDEEM_CLAIMED: 'redeemsClaimed',
  REDEEM_CANCELLED: 'redeemsCancelled',
}

export async function getGlobalBtcVaultHistory(params: {
  limit: number
  page: number
  sort_field: 'timestamp' | 'assets'
  sort_direction: 'asc' | 'desc'
  type?: string[]
  address?: string
}): Promise<BtcVaultHistoryItem[]> {
  const { limit, page, sort_field, sort_direction, type, address } = params
  const skip = (page - 1) * limit

  const actionFilter = type ? type.map(t => t.toUpperCase()) : [...ALL_ACTION_TYPES]

  const query = address ? BTC_VAULT_USER_HISTORY_QUERY : BTC_VAULT_GLOBAL_HISTORY_QUERY
  const variables: Record<string, unknown> = {
    first: limit,
    skip,
    orderBy: sort_field,
    orderDirection: sort_direction,
    actionFilter,
  }

  if (address) {
    variables.user = address.toLowerCase()
  }

  const { data } = await btcVaultClient.query<{
    btcVaultHistories: BtcVaultHistoryItem[]
  }>({
    query,
    variables,
    fetchPolicy: 'no-cache',
  })

  return (data?.btcVaultHistories ?? []).map(item => ({
    ...item,
    timestamp: Number(item.timestamp),
  }))
}

/**
 * Fetches BtcDepositRequest and BtcRedeemRequest status for *_REQUEST history rows and maps
 * to displayStatus (open_to_claim, claim_pending, pending, cancelled). CLAIMED/CANCELLED rows
 * get successful/cancelled from action without a subgraph lookup.
 */
export async function enrichHistoryWithRequestStatus(
  history: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  const depositIds = new Set<string>()
  const redeemIds = new Set<string>()
  for (const item of history) {
    const id = `${item.user.toLowerCase()}-${item.epochId}`
    if (item.action === 'DEPOSIT_REQUEST') depositIds.add(id)
    else if (item.action === 'REDEEM_REQUEST') redeemIds.add(id)
  }

  let depositStatusById: Record<string, string> = {}
  let redeemStatusById: Record<string, string> = {}

  if (depositIds.size > 0) {
    const ids = [...depositIds]
    const { data } = await btcVaultClient.query<{
      btcDepositRequests: { id: string; status: string }[]
    }>({
      query: BTC_VAULT_DEPOSIT_REQUESTS_BY_IDS,
      variables: { ids, first: ids.length },
      fetchPolicy: 'no-cache',
    })
    for (const r of data?.btcDepositRequests ?? []) {
      depositStatusById[r.id] = r.status
    }
  }

  if (redeemIds.size > 0) {
    const ids = [...redeemIds]
    const { data } = await btcVaultClient.query<{
      btcRedeemRequests: { id: string; status: string }[]
    }>({
      query: BTC_VAULT_REDEEM_REQUESTS_BY_IDS,
      variables: { ids, first: ids.length },
      fetchPolicy: 'no-cache',
    })
    for (const r of data?.btcRedeemRequests ?? []) {
      redeemStatusById[r.id] = r.status
    }
  }

  return history.map((item): BtcVaultHistoryItemWithStatus => {
    const result: BtcVaultHistoryItemWithStatus = { ...item }
    if (item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST') {
      const id = `${item.user.toLowerCase()}-${item.epochId}`
      const status = item.action === 'DEPOSIT_REQUEST' ? depositStatusById[id] : redeemStatusById[id]
      if (status === 'CLAIMABLE') {
        result.displayStatus = item.action === 'DEPOSIT_REQUEST' ? 'open_to_claim' : 'claim_pending'
      } else if (status === 'CANCELLED') {
        result.displayStatus = 'cancelled'
      } else {
        result.displayStatus = 'pending'
      }
    } else if (item.action === 'DEPOSIT_CLAIMED' || item.action === 'REDEEM_CLAIMED') {
      result.displayStatus = 'successful'
    } else if (item.action === 'DEPOSIT_CANCELLED' || item.action === 'REDEEM_CANCELLED') {
      result.displayStatus = 'cancelled'
    }
    return result
  })
}

interface CounterEntity {
  total: string
  depositRequests: string
  depositsClaimed: string
  depositsCancelled: string
  redeemRequests: string
  redeemsClaimed: string
  redeemsCancelled: string
}

export async function getBtcVaultHistoryCount(address: string, type?: string[]): Promise<number> {
  const { data } = await btcVaultClient.query<{
    btcVaultHistoryCounter: CounterEntity | null
  }>({
    query: BTC_VAULT_HISTORY_COUNTER_QUERY,
    variables: { id: address.toLowerCase() },
    fetchPolicy: 'no-cache',
  })

  const counter = data?.btcVaultHistoryCounter
  if (!counter) return 0

  if (!type || type.length === 0) {
    return Number(counter.total)
  }

  return type.reduce((sum, t) => {
    const field = ACTION_TYPE_TO_COUNTER_FIELD[t.toUpperCase()]
    if (field) {
      return sum + Number(counter[field as keyof CounterEntity])
    }
    return sum
  }, 0)
}
