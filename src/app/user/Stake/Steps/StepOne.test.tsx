import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StakingProvider } from '../StakingContext'
import { StakingToken } from '../types'
import { StepOne } from './StepOne'

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
  // The boost notice sits below the input; the USD figure stays whether or not the flag is on
  it('shows the amount in USD', () => {
    renderStep()
    expect(screen.getByText('$0.00')).toBeDefined()
  })
})
