import { beforeEach, describe, expect, it } from 'vitest'

import { RIF, USDRIF, USDT0, WRBTC } from '@/lib/constants'

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

  it('setTokenOut swaps tokenIn when it would match the new tokenOut (RIF collision)', () => {
    useSwapStore.setState({ tokenIn: RIF, tokenOut: USDRIF })
    useSwapStore.getState().setTokenOut(RIF)
    expect(useSwapStore.getState().tokenOut).toBe(RIF)
    expect(useSwapStore.getState().tokenIn).toBe(USDT0)
  })

  it('setTokenIn keeps a distinct tokenOut when selecting WrBTC', () => {
    useSwapStore.setState({ tokenIn: USDT0, tokenOut: USDRIF })
    useSwapStore.getState().setTokenIn(WRBTC)
    expect(useSwapStore.getState().tokenIn).toBe(WRBTC)
    expect(useSwapStore.getState().tokenOut).toBe(USDRIF)
  })

  it('setTokenOut avoids duplicate pair when choosing WRBTC from RIF', () => {
    useSwapStore.setState({ tokenIn: RIF, tokenOut: USDRIF })
    useSwapStore.getState().setTokenOut(WRBTC)
    expect(useSwapStore.getState().tokenOut).toBe(WRBTC)
    expect(useSwapStore.getState().tokenIn).toBe(RIF)
  })

  it('toggleTokens swaps sides and resets selectedFeeTier to Auto', () => {
    useSwapStore.setState({
      tokenIn: USDT0,
      tokenOut: USDRIF,
      selectedFeeTier: 500,
      typedAmount: '12.5',
    })
    useSwapStore.getState().toggleTokens()
    const s = useSwapStore.getState()
    expect(s.tokenIn).toBe(USDRIF)
    expect(s.tokenOut).toBe(USDT0)
    expect(s.selectedFeeTier).toBeNull()
    expect(s.typedAmount).toBe('')
  })

  it('setTokenIn clears typedAmount and swapError', () => {
    useSwapStore.setState({
      typedAmount: '99',
      swapError: new Error('prior'),
    })
    useSwapStore.getState().setTokenIn(USDRIF)
    const s = useSwapStore.getState()
    expect(s.typedAmount).toBe('')
    expect(s.swapError).toBeNull()
  })
})
