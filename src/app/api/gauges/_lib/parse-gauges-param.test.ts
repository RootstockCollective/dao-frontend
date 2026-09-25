import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import { MAX_GAUGES_PER_REQUEST, parseGaugesParam } from './parse-gauges-param'

const GAUGE_A = '0x1111111111111111111111111111111111111111'
const GAUGE_MIXED = getAddress('0xabcdef0123456789abcdef0123456789abcdef01')

const request = (gauges?: string) =>
  new Request(
    gauges === undefined
      ? 'http://localhost/api/gauges/x'
      : `http://localhost/api/gauges/x?gauges=${encodeURIComponent(gauges)}`,
  )

async function errorOf(result: ReturnType<typeof parseGaugesParam>) {
  if (!('error' in result)) throw new Error('expected an error response')
  return { status: result.error.status, body: await result.error.json() }
}

describe('parseGaugesParam', () => {
  it('returns the gauges as the caller spelled them, trimmed and without empty entries', () => {
    expect(parseGaugesParam(request(` ${GAUGE_A} ,,${GAUGE_MIXED}`))).toEqual({
      gauges: [GAUGE_A, GAUGE_MIXED],
    })
  })

  it.each([undefined, '', ' , '])('answers 400 when gauges is %j', async gauges => {
    expect(await errorOf(parseGaugesParam(request(gauges)))).toEqual({
      status: 400,
      body: { error: 'Missing required `gauges` query param' },
    })
  })

  it('answers 400 above the per-request cap', async () => {
    const gauges = Array.from({ length: MAX_GAUGES_PER_REQUEST + 1 }, () => GAUGE_A).join(',')

    expect((await errorOf(parseGaugesParam(request(gauges)))).status).toBe(400)
  })

  it('accepts exactly the per-request cap', () => {
    const gauges = Array.from({ length: MAX_GAUGES_PER_REQUEST }, () => GAUGE_A).join(',')

    expect(parseGaugesParam(request(gauges))).toHaveProperty('gauges')
  })

  it('answers 400 when any entry is not an address', async () => {
    expect(await errorOf(parseGaugesParam(request(`${GAUGE_A},0x123`)))).toEqual({
      status: 400,
      body: { error: 'Invalid gauge address in `gauges`' },
    })
  })
})
