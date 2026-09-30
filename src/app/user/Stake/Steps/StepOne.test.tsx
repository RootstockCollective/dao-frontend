import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StakingProvider } from '../StakingContext'
import { StakingToken } from '../types'
import { StepOne } from './StepOne'

const mockShowsFiatAmounts = vi.fn<() => boolean>()

vi.mock('@/app/collective-rewards/abi-boost/hooks/useAbiBoost', () => ({
  useShowsFiatAmounts: () => mockShowsFiatAmounts(),
}))

vi.mock('@/app/collective-rewards/abi-boost/components/StakeBoost', () => ({
  StakeBoostNotice: () => null,
}))

const token = (symbol: string): StakingToken => ({ balance: '100', symbol, price: '1', contract: '0x0' })

const renderStep = () =>
  render(
    <StakingProvider tokenToSend={token('RIF')} tokenToReceive={token('stRIF')}>
      <StepOne onGoNext={vi.fn()} onGoBack={vi.fn()} onCloseModal={vi.fn()} onGoToStep={vi.fn()} />
    </StakingProvider>,
  )

afterEach(cleanup)

describe('StepOne', () => {
  it('shows the amount in USD without the boost flag', () => {
    mockShowsFiatAmounts.mockReturnValue(true)
    renderStep()
    expect(screen.getByText('$0.00')).toBeDefined()
  })

  it('reads in RIF only with the boost flag', () => {
    mockShowsFiatAmounts.mockReturnValue(false)
    renderStep()
    expect(screen.queryByText('$0.00')).toBeNull()
  })
})
