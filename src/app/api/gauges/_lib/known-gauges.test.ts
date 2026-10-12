import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))
// Outside a Next request there is no incremental cache; the loader runs straight through.
vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }))

import { filterKnownGauges } from './known-gauges'

const KNOWN = '0xabcdef0123456789abcdef0123456789abcdef01'
const UNKNOWN = '0x1111111111111111111111111111111111111111'

function selectStub(rows: unknown[]) {
  const select = vi.fn(() => Promise.resolve(rows))
  return { chain: { select }, select }
}

describe('filterKnownGauges', () => {
  beforeEach(() => mockDb.mockReset())

  it('reads the gauge ids from GaugeToBuilder', async () => {
    const stub = selectStub([])
    mockDb.mockReturnValue(stub.chain)

    await filterKnownGauges([KNOWN])

    expect(mockDb).toHaveBeenCalledWith('GaugeToBuilder')
    expect(stub.select).toHaveBeenCalledWith('id')
  })

  it('keeps known gauges in the order given and drops the rest', async () => {
    const other = '0x2222222222222222222222222222222222222222'
    mockDb.mockReturnValue(selectStub([{ id: other }, { id: KNOWN }]).chain)

    await expect(filterKnownGauges([KNOWN, UNKNOWN, other])).resolves.toEqual([KNOWN, other])
  })

  it('matches a gauge sent in any casing and returns it lowercased', async () => {
    mockDb.mockReturnValue(selectStub([{ id: KNOWN }]).chain)
    const checksummed = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01'

    await expect(filterKnownGauges([checksummed, KNOWN.toUpperCase()])).resolves.toEqual([KNOWN, KNOWN])
  })

  it('matches ids decoded from a Buffer, for a connection without the bytea parser', async () => {
    mockDb.mockReturnValue(selectStub([{ id: Buffer.from(KNOWN.toUpperCase(), 'utf8') }]).chain)

    await expect(filterKnownGauges([KNOWN])).resolves.toEqual([KNOWN])
  })
})
