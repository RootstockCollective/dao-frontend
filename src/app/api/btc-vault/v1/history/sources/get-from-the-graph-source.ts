import { gql } from '@apollo/client'

import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { btcVaultClient } from '@/shared/components/ApolloClient'

import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from '../types'
import type { BtcVaultHistorySource } from './types'

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
      depositsClaimable
      depositsClaimed
      depositsCancelled
      redeemRequests
      redeemsClaimable
      redeemsClaimed
      redeemsCancelled
      redeemsAccepted
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
  DEPOSIT_CLAIMABLE: 'depositsClaimable',
  DEPOSIT_CLAIMED: 'depositsClaimed',
  DEPOSIT_CANCELLED: 'depositsCancelled',
  REDEEM_REQUEST: 'redeemRequests',
  REDEEM_CLAIMABLE: 'redeemsClaimable',
  REDEEM_CLAIMED: 'redeemsClaimed',
  REDEEM_CANCELLED: 'redeemsCancelled',
  REDEEM_ACCEPTED: 'redeemsAccepted',
}

interface CounterEntity {
  total: string
  depositRequests: string
  depositsClaimable: string
  depositsClaimed: string
  depositsCancelled: string
  redeemRequests: string
  redeemsClaimable: string
  redeemsClaimed: string
  redeemsCancelled: string
  redeemsAccepted: string
}

export async function queryBtcVaultHistoryFromSubgraph(
  params: BtcVaultHistoryQueryParams,
): Promise<BtcVaultHistoryItem[]> {
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

  const result = await btcVaultClient.query<{
    btcVaultHistories: BtcVaultHistoryItem[]
  }>({
    query,
    variables,
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const rows = result.data?.btcVaultHistories
  if (rows === undefined) {
    throw new Error('Subgraph returned no btcVaultHistories data')
  }

  return rows.map(item => ({
    ...item,
    timestamp: Number(item.timestamp),
  }))
}

export async function queryBtcVaultHistoryCountFromSubgraph(
  address: string,
  type?: string[],
): Promise<number> {
  const result = await btcVaultClient.query<{
    btcVaultHistoryCounter: CounterEntity | null
  }>({
    query: BTC_VAULT_HISTORY_COUNTER_QUERY,
    variables: { id: address.toLowerCase() },
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const counter = result.data?.btcVaultHistoryCounter
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

/**
 * Fetches BtcDepositRequest and BtcRedeemRequest status for *_REQUEST history rows and maps
 * to displayStatus (ready_to_claim, ready_to_withdraw, pending, cancelled). CLAIMED/CANCELLED rows
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
    const result = await btcVaultClient.query<{
      btcDepositRequests: { id: string; status: string }[]
    }>({
      query: BTC_VAULT_DEPOSIT_REQUESTS_BY_IDS,
      variables: { ids, first: ids.length },
      fetchPolicy: 'no-cache',
    })
    if (result.error) {
      throw result.error
    }
    for (const r of result.data?.btcDepositRequests ?? []) {
      depositStatusById[r.id] = r.status
    }
  }

  if (redeemIds.size > 0) {
    const ids = [...redeemIds]
    const result = await btcVaultClient.query<{
      btcRedeemRequests: { id: string; status: string }[]
    }>({
      query: BTC_VAULT_REDEEM_REQUESTS_BY_IDS,
      variables: { ids, first: ids.length },
      fetchPolicy: 'no-cache',
    })
    if (result.error) {
      throw result.error
    }
    for (const r of result.data?.btcRedeemRequests ?? []) {
      redeemStatusById[r.id] = r.status
    }
  }

  return history.map((item): BtcVaultHistoryItemWithStatus => {
    const result: BtcVaultHistoryItemWithStatus = { ...item }
    if (item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST') {
      const id = `${item.user.toLowerCase()}-${item.epochId}`
      const status = item.action === 'DEPOSIT_REQUEST' ? depositStatusById[id] : redeemStatusById[id]
      if (status === 'CLAIMABLE') {
        result.displayStatus = item.action === 'DEPOSIT_REQUEST' ? 'ready_to_claim' : 'ready_to_withdraw'
      } else if (status === 'CANCELLED') {
        result.displayStatus = 'cancelled'
      } else {
        result.displayStatus = 'pending'
      }
    } else if (item.action === 'DEPOSIT_CLAIMABLE') {
      result.displayStatus = 'ready_to_claim'
    } else if (item.action === 'REDEEM_CLAIMABLE') {
      result.displayStatus = 'ready_to_withdraw'
    } else if (item.action === 'DEPOSIT_CLAIMED' || item.action === 'REDEEM_CLAIMED') {
      result.displayStatus = 'successful'
    } else if (item.action === 'DEPOSIT_CANCELLED' || item.action === 'REDEEM_CANCELLED') {
      result.displayStatus = 'cancelled'
    } else if (item.action === 'REDEEM_ACCEPTED') {
      result.displayStatus = 'approved'
    }
    return result
  })
}

export interface GetFromTheGraphSourceOptions {
  /** Used when subgraph status enrichment fails (same semantics as Blockscout RPC fallback). */
  mapActionOnly: (item: BtcVaultHistoryItem) => BtcVaultHistoryItemWithStatus
}

/**
 * The Graph history source: paginated list + counter from subgraph, status enrichment via subgraph entities.
 */
export function getFromTheGraphSource(options: GetFromTheGraphSourceOptions): BtcVaultHistorySource {
  const { mapActionOnly } = options
  return {
    name: 'the-graph',
    async fetchPageAndTotal(params: BtcVaultHistoryQueryParams) {
      const [items, total] = await Promise.all([
        queryBtcVaultHistoryFromSubgraph(params),
        queryBtcVaultHistoryCountFromSubgraph(params.address ?? 'global', params.type),
      ])
      return { items, total }
    },
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      try {
        return await enrichHistoryWithRequestStatus(items)
      } catch (error) {
        console.warn(
          '[btc-vault][DAO-2106] Subgraph enrichment failed; using action-only displayStatus',
          error,
        )
        return items.map(mapActionOnly)
      }
    },
  }
}
