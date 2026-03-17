import { gql } from '@apollo/client'

import type { BtcVaultHistoryItem } from '@/app/api/btc-vault/v1/addresses/[address]/history/action'
import { getBtcVaultHistoryCount } from '@/app/api/btc-vault/v1/addresses/[address]/history/action'
import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { btcVaultClient } from '@/shared/components/ApolloClient'

export type { BtcVaultHistoryItem }
export { getBtcVaultHistoryCount }

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
