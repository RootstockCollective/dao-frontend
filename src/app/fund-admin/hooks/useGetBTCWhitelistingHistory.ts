'use client'

import { useQuery } from '@tanstack/react-query'

import type {
  BtcVaultWhitelistedUserItem,
  BtcVaultWhitelistedUsersSortField,
} from '@/app/api/btc-vault/v1/whitelist-role-history/action'
import { getBtcVaultWhitelistRoleHistoryEndpoint } from '@/lib/endpoints'

interface WhitelistRoleHistoryPagination {
  page: number
  limit: number
  offset: number
  total: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
  totalPages?: number
}

interface WhitelistRoleHistoryApiResponse {
  data: BtcVaultWhitelistedUserItem[]
  pagination: WhitelistRoleHistoryPagination
}

interface UseGetBTCWhitelistingHistoryParams {
  page: number
  limit: number
  sortField: BtcVaultWhitelistedUsersSortField
  sortDirection: 'asc' | 'desc'
}

function buildWhitelistHistoryUrl(params: UseGetBTCWhitelistingHistoryParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  searchParams.set('sort_field', params.sortField)
  searchParams.set('sort_direction', params.sortDirection)
  return `${getBtcVaultWhitelistRoleHistoryEndpoint}?${searchParams.toString()}`
}

/** Prefix for React Query keys; use with `refetchQueries` / `invalidateQueries` for all whitelist pages. */
export const BTC_VAULT_WHITELISTED_USERS_QUERY_KEY = ['btc-vault', 'whitelisted-users'] as const

export function useGetBTCWhitelistingHistory(params: UseGetBTCWhitelistingHistoryParams) {
  const query = useQuery({
    queryKey: [...BTC_VAULT_WHITELISTED_USERS_QUERY_KEY, params],
    queryFn: async () => {
      const url = buildWhitelistHistoryUrl(params)
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Whitelist history API error: ${res.status} ${text}`)
      }
      return (await res.json()) as WhitelistRoleHistoryApiResponse
    },
    staleTime: 30_000,
  })

  return {
    ...query,
    rows: query.data?.data,
    pagination: query.data?.pagination,
  }
}
