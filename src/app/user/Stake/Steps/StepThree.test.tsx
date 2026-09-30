import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StakingProvider } from '../StakingContext'
import { StakingToken } from '../types'
import { StepThree } from './StepThree'

const mockIsAbiBoostEnabled = vi.fn<() => boolean>()

vi.mock('@/app/collective-rewards/abi-boost/hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => mockIsAbiBoostEnabled(),
}))

vi.mock('@/app/collective-rewards/abi-boost/components/StakeBoost', () => ({
  StakeBoostSummary: () => <div data-testid="StakeBoostSummary" />,
  useStakeBoostOutlook: () => 'eligible',
}))

// Stable across renders: StepThree feeds these into an effect that updates the staking context,
// so a fresh function per render would re-run it forever
const stakeRif = {
  onRequestStake: vi.fn(),
  isRequesting: false,
  isTxPending: false,
  isTxFailed: false,
  stakeTxHash: undefined,
}
const balances = { refetchBalances: vi.fn() }

// The real preview needs a typed amount; only which layout renders matters here
vi.mock('../components/StakeTokenAmountDisplay', () => ({
  StakeTokenAmountDisplay: ({ label }: { label: string }) => <span>{label}</span>,
}))

vi.mock('../hooks/useStakeRIF', () => ({
  useStakeRIF: () => stakeRif,
}))

vi.mock('@/app/user/Balances/hooks/useGetAddressBalances', () => ({
  useGetAddressBalances: () => balances,
}))

const token = (symbol: string): StakingToken => ({ balance: '100', symbol, price: '1', contract: '0x0' })

const noop = () => {}
const tokenToSend = token('RIF')
const tokenToReceive = token('stRIF')

const renderStep = () =>
  render(
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <StepThree onGoNext={noop} onGoBack={noop} onCloseModal={noop} onGoToStep={noop} />
    </StakingProvider>,
  )

afterEach(cleanup)

describe('StepThree', () => {
  it('keeps the From / To preview without the boost flag', () => {
    mockIsAbiBoostEnabled.mockReturnValue(false)
    renderStep()
    expect(screen.getByText('From')).toBeDefined()
    expect(screen.queryByTestId('StakeBoostSummary')).toBeNull()
  })

  it('reviews the stake as the boost summary with the flag', () => {
    mockIsAbiBoostEnabled.mockReturnValue(true)
    renderStep()
    expect(screen.getByTestId('StakeBoostSummary')).toBeDefined()
    expect(screen.queryByText('From')).toBeNull()
  })
})
