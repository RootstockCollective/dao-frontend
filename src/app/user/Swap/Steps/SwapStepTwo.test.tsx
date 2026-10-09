// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
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

const signPermit = vi.fn()
const refetchAllowance = vi.fn()

function renderStepTwo() {
  const onGoNext = vi.fn()
  const onGoBack = vi.fn()
  const setButtonActions = vi.fn()
  render(
    <SwapStepTwo
      onGoNext={onGoNext}
      onGoBack={onGoBack}
      onCloseModal={vi.fn()}
      onGoToStep={vi.fn()}
      setButtonActions={setButtonActions}
    />,
  )
  const clickSign = () => act(() => setButtonActions.mock.lastCall![0].primary.onClick())
  return { onGoNext, onGoBack, clickSign }
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
    vi.mocked(usePermitSigning).mockReturnValue({
      signPermit,
      isSigning: false,
      permit: null,
      permitSignature: null,
    } as unknown as ReturnType<typeof usePermitSigning>)
    vi.mocked(useTokenAllowance).mockReturnValue({ refetchAllowance } as unknown as ReturnType<
      typeof useTokenAllowance
    >)
  })

  it('signs the permit when the token allowance covers the amount', async () => {
    refetchAllowance.mockResolvedValue({ data: 2n * 10n ** 18n })
    const { onGoNext, onGoBack, clickSign } = renderStepTwo()

    await clickSign()

    expect(signPermit).toHaveBeenCalledTimes(1)
    expect(onGoNext).toHaveBeenCalledTimes(1)
    expect(onGoBack).not.toHaveBeenCalled()
  })

  it('returns to step 1 when the amount grew past the token allowance', async () => {
    refetchAllowance.mockResolvedValue({ data: 1n * 10n ** 18n })
    const { onGoNext, onGoBack, clickSign } = renderStepTwo()

    await clickSign()

    expect(onGoBack).toHaveBeenCalledTimes(1)
    expect(signPermit).not.toHaveBeenCalled()
    expect(onGoNext).not.toHaveBeenCalled()
  })
})
