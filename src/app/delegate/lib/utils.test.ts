import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<object>()),
  DELEGATES_DENYLIST: ['0x17296956b4e07ff8931e4ff4ea06709fab70b879', 'curia.rsk'],
}))

import { isDeniedDelegate } from './utils'

describe('isDeniedDelegate', () => {
  it('matches denied addresses regardless of casing', () => {
    expect(isDeniedDelegate('0x17296956b4E07Ff8931E4fF4EA06709fAb70B879')).toBe(true)
  })

  it('matches denied RNS domains', () => {
    expect(isDeniedDelegate(' Curia.rsk ')).toBe(true)
  })

  it('lets every other delegate through', () => {
    expect(isDeniedDelegate('0xd40b4ed6BcDC63261aaE3eb9EB72D00BAFB7A032')).toBe(false)
    expect(isDeniedDelegate('puddii.rsk')).toBe(false)
  })
})
