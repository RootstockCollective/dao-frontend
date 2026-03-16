import { gql } from '@apollo/client'

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

const ALL_ACTION_TYPES = [
  'DEPOSIT_REQUEST',
  'DEPOSIT_CLAIMED',
  'DEPOSIT_CANCELLED',
  'REDEEM_REQUEST',
  'REDEEM_CLAIMED',
  'REDEEM_CANCELLED',
] as const

const BTC_VAULT_HISTORY_QUERY = gql`
  query BtcVaultHistory(
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

const ACTION_TYPE_TO_COUNTER_FIELD: Record<string, string> = {
  DEPOSIT_REQUEST: 'depositRequests',
  DEPOSIT_CLAIMED: 'depositsClaimed',
  DEPOSIT_CANCELLED: 'depositsCancelled',
  REDEEM_REQUEST: 'redeemRequests',
  REDEEM_CLAIMED: 'redeemsClaimed',
  REDEEM_CANCELLED: 'redeemsCancelled',
}

export async function getBtcVaultHistory(params: {
  address: string
  limit: number
  page: number
  sort_field: 'timestamp' | 'assets'
  sort_direction: 'asc' | 'desc'
  type?: string[]
}): Promise<BtcVaultHistoryItem[]> {
  const { address, limit, page, sort_field, sort_direction, type } = params
  const skip = (page - 1) * limit

  const actionFilter = type ? type.map(t => t.toUpperCase()) : [...ALL_ACTION_TYPES]

  const { data } = await btcVaultClient.query<{
    btcVaultHistories: BtcVaultHistoryItem[]
  }>({
    query: BTC_VAULT_HISTORY_QUERY,
    variables: {
      user: address.toLowerCase(),
      first: limit,
      skip,
      orderBy: sort_field,
      orderDirection: sort_direction,
      actionFilter,
    },
    fetchPolicy: 'no-cache',
  })

  return (data?.btcVaultHistories ?? []).map(item => ({
    ...item,
    timestamp: Number(item.timestamp),
  }))
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
