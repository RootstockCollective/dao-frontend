import { describe, expect, it } from 'vitest'

import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import { lockedSharePriceFromEpochSnapshot } from './vaultShareNav'

/** One human share in raw on-chain units (18 + 6 decimals). */
const ONE_SHARE_RAW = WeiPerEther * VAULT_SHARE_MULTIPLIER

describe('lockedSharePriceFromEpochSnapshot', () => {
  it('returns 0n when supplyAtCloseRaw + 1 is not positive (e.g. -1n)', () => {
    expect(lockedSharePriceFromEpochSnapshot(100n * WeiPerEther, -1n)).toBe(0n)
  })

  it('matches proportional rBTC wei via nav vs direct snapshot formula (toy closed system)', () => {
    const assetsAtCloseWei = 124_000_000_000_000n
    const supplyAtCloseWei = ONE_SHARE_RAW
    const nav = lockedSharePriceFromEpochSnapshot(assetsAtCloseWei, supplyAtCloseWei)
    const shares = ONE_SHARE_RAW
    const rbtcWeiViaNav = (shares * nav) / WeiPerEther
    const rbtcWeiDirect = (shares * (assetsAtCloseWei + 1n)) / (supplyAtCloseWei + 1n)
    expect(rbtcWeiViaNav).toBe(rbtcWeiDirect)
  })

  it('matches par snapshot (100 rBTC / 100 shares raw)', () => {
    const assetsAtCloseWei = 100n * WeiPerEther
    const supplyAtCloseWei = 100n * ONE_SHARE_RAW
    const nav = lockedSharePriceFromEpochSnapshot(assetsAtCloseWei, supplyAtCloseWei)
    const oneShareRbtcWei = (ONE_SHARE_RAW * nav) / WeiPerEther
    expect(oneShareRbtcWei).toBe(WeiPerEther)
  })
})
