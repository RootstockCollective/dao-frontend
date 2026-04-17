import type { ActiveFilter } from '@/components/FilterSideBar/types'
import { describe, expect, it } from 'vitest'

import { buildAuditLogUrl, toAuditLogApiFilters } from './utils'

describe('toAuditLogApiFilters', () => {
  it('returns undefined when no known filters are selected', () => {
    const filters: ActiveFilter[] = [{ groupId: 'unknown', option: { label: 'X', value: 'x' } }]
    expect(toAuditLogApiFilters(filters)).toBeUndefined()
  })

  it('maps and deduplicates canonical type/role/show filters', () => {
    const filters: ActiveFilter[] = [
      { groupId: 'type', option: { label: 'Vault deposit', value: 'VAULT_DEPOSIT' } },
      { groupId: 'type', option: { label: 'Deposit', value: 'VAULT_DEPOSIT' } },
      { groupId: 'role', option: { label: 'Fund manager', value: 'MANAGER' } },
      { groupId: 'show', option: { label: 'Reason', value: 'reason' } },
      { groupId: 'show', option: { label: 'rBTC', value: 'rbtc' } },
    ]

    expect(toAuditLogApiFilters(filters)).toEqual({
      type: ['VAULT_DEPOSIT'],
      role: ['MANAGER'],
      show: ['reason', 'rbtc'],
    })
  })
})

describe('buildAuditLogUrl', () => {
  it('serializes repeated query params for filters', () => {
    const url = buildAuditLogUrl({
      page: 2,
      limit: 50,
      sortField: 'date',
      sortDirection: 'asc',
      filters: {
        type: ['VAULT_DEPOSIT', 'NAV_UPDATED'],
        role: ['MANAGER'],
        show: ['reason', 'wrbtc'],
      },
    })

    expect(url).toContain('/api/btc-vault/v1/audit-log?')
    expect(url).toContain('page=2')
    expect(url).toContain('limit=50')
    expect(url).toContain('sort_field=date')
    expect(url).toContain('sort_direction=asc')
    expect(url).toContain('type=VAULT_DEPOSIT')
    expect(url).toContain('type=NAV_UPDATED')
    expect(url).toContain('role=MANAGER')
    expect(url).toContain('show=reason')
    expect(url).toContain('show=wrbtc')
  })
})
