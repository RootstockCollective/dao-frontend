import { beforeEach, describe, expect, it } from 'vitest'

import { RIF, USDRIF, USDT0 } from '@/lib/constants'

import { useSwapStore } from './useSwapStore'

describe('useSwapStore token selection', () => {
  beforeEach(() => {
    useSwapStore.getState().reset()
  })

  it('setTokenIn replaces tokenOut when it would match the new tokenIn', () => {
    useSwapStore.setState({ tokenIn: USDT0, tokenOut: USDRIF })
    useSwapStore.getState().setTokenIn(USDRIF)
    expect(useSwapStore.getState().tokenIn).toBe(USDRIF)
    expect(useSwapStore.getState().tokenOut).toBe(USDT0)
  })

  it('setTokenOut replaces tokenIn when it would match the new tokenOut', () => {
    useSwapStore.setState({ tokenIn: USDT0, tokenOut: USDRIF })
    useSwapStore.getState().setTokenOut(USDT0)
    expect(useSwapStore.getState().tokenOut).toBe(USDT0)
    expect(useSwapStore.getState().tokenIn).toBe(USDRIF)
  })

  it('setTokenIn keeps tokenOut when the pair stays valid', () => {
    useSwapStore.setState({ tokenIn: USDT0, tokenOut: USDRIF })
    useSwapStore.getState().setTokenIn(RIF)
    expect(useSwapStore.getState().tokenIn).toBe(RIF)
    expect(useSwapStore.getState().tokenOut).toBe(USDRIF)
  })
})
