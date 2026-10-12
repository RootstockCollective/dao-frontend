// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RIF } from '@/lib/constants'
import { usePermitSigning, useSwapInput, useTokenAllowance, useTokenSelection } from '@/shared/stores/swap'

import { SwapStepTwo } from './SwapStepTwo'

vi.mock('@/shared/stores/swap', () => ({
  usePermitSigning: vi.fn(),
  useSwapInput: vi.fn(),
  useTokenAllowance: vi.fn(),
  useTokenSelection: vi.fn(),
}))

vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({ prices: { [RIF]: { price: 0.1 } } }),
}))

const TWO_RIF = 2n * 10n ** 18n
const signPermit = vi.fn()

function mockAllowance(allowance: bigint | null) {
  vi.mocked(useTokenAllowance).mockReturnValue({
    allowance,
    isCheckingAllowance: false,
  } as unknown as ReturnType<typeof useTokenAllowance>)
}

function mockPermit(amount: bigint | null) {
  vi.mocked(usePermitSigning).mockReturnValue({
    signPermit,
    isSigning: false,
    permit: amount === null ? null : { details: { amount } },
    permitSignature: amount === null ? null : '0xsig',
  } as unknown as ReturnType<typeof usePermitSigning>)
}

function renderStepTwo() {
  const onGoNext = vi.fn()
  const setButtonActions = vi.fn()
  render(
    <SwapStepTwo
      onGoNext={onGoNext}
      onGoBack={vi.fn()}
      onCloseModal={vi.fn()}
      onGoToStep={vi.fn()}
      setButtonActions={setButtonActions}
    />,
  )
  const primary = () => setButtonActions.mock.lastCall![0].primary
  return { onGoNext, primary }
}

describe('SwapStepTwo', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    signPermit.mockResolvedValue({})
    vi.mocked(useSwapInput).mockReturnValue({ amountIn: '2' } as ReturnType<typeof useSwapInput>)
    vi.mocked(useTokenSelection).mockReturnValue({
      tokenInData: { symbol: RIF, decimals: 18 },
    } as ReturnType<typeof useTokenSelection>)
    mockPermit(null)
  })

  it('signs the permit when the token allowance covers the amount', async () => {
    mockAllowance(TWO_RIF)
    const { onGoNext, primary } = renderStepTwo()

    expect(primary().disabled).toBe(false)
    await act(() => primary().onClick())

    expect(signPermit).toHaveBeenCalledTimes(1)
    expect(onGoNext).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('swap-allowance-short-warning')).not.toBeInTheDocument()
  })

  it('blocks signing and asks to go back when the amount grew past the token allowance', () => {
    mockAllowance(TWO_RIF - 1n)
    const { primary } = renderStepTwo()

    expect(primary().disabled).toBe(true)
    expect(screen.getByTestId('swap-allowance-short-warning')).toBeInTheDocument()
  })

  it('does not auto-advance on an existing permit when the token allowance falls short', () => {
    mockPermit(TWO_RIF)
    mockAllowance(TWO_RIF - 1n)
    const { onGoNext } = renderStepTwo()

    expect(onGoNext).not.toHaveBeenCalled()
  })

  it('auto-advances on an existing permit when the token allowance covers the amount', () => {
    mockPermit(TWO_RIF)
    mockAllowance(TWO_RIF)
    const { onGoNext } = renderStepTwo()

    expect(onGoNext).toHaveBeenCalledTimes(1)
  })
})
