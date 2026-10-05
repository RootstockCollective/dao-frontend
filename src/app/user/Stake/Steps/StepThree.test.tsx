import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { StakeBoostOutlook } from '@/app/collective-rewards/abi-boost/abiBoost.utils'

import { StakingProvider, useStakingContext } from '../StakingContext'
import { StakingToken } from '../types'
import { StepThree } from './StepThree'

const mockIsAbiBoostEnabled = vi.fn<() => boolean>()
const mockOutlook = vi.fn<() => StakeBoostOutlook | null>(() => ({ kind: 'eligible', becomesEligible: true }))

vi.mock('@/app/collective-rewards/abi-boost/hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => mockIsAbiBoostEnabled(),
}))

vi.mock('@/app/collective-rewards/abi-boost/components/StakeBoost', () => ({
  StakeBoostSummary: () => <div data-testid="StakeBoostSummary" />,
  useStakeBoostOutlook: () => mockOutlook(),
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

// The stake lands as soon as it is confirmed
vi.mock('@/shared/notification', () => ({
  executeTxFlow: ({ onSuccess }: { onSuccess: () => void }) => onSuccess(),
}))

const token = (symbol: string): StakingToken => ({ balance: '100', symbol, price: '1', contract: '0x0' })

const noop = () => {}
const tokenToSend = token('RIF')
const tokenToReceive = token('stRIF')

// StepWrapper renders the buttons from the context; this stands in for it
const ConfirmButton = () => {
  const { buttonActions } = useStakingContext()
  return <button onClick={buttonActions.primary.onClick}>confirm</button>
}

const renderStep = (props: { onCloseModal?: () => void; onBoostEligible?: (amount: string) => void } = {}) =>
  render(
    <StakingProvider tokenToSend={tokenToSend} tokenToReceive={tokenToReceive}>
      <StepThree
        onGoNext={noop}
        onGoBack={noop}
        onCloseModal={props.onCloseModal ?? noop}
        onGoToStep={noop}
        onBoostEligible={props.onBoostEligible}
      />
      <ConfirmButton />
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

  it.each<[string, StakeBoostOutlook | null, boolean]>([
    ['takes the wallet over the minimum', { kind: 'eligible', becomesEligible: true }, true],
    ['leaves an already eligible wallet eligible', { kind: 'eligible', becomesEligible: false }, false],
    ['adds to a boost that is already active', { kind: 'active' }, false],
    ['stays under the minimum', { kind: 'belowMinimum', missing: 1n }, false],
    ['lands before the position is known', null, false],
  ])('after a stake that %s, picks the eligibility modal or closing', (_, outlook, opensModal) => {
    mockIsAbiBoostEnabled.mockReturnValue(true)
    mockOutlook.mockReturnValue(outlook)
    const onCloseModal = vi.fn()
    const onBoostEligible = vi.fn()
    renderStep({ onCloseModal, onBoostEligible })

    fireEvent.click(screen.getByText('confirm'))
    expect(onBoostEligible).toHaveBeenCalledTimes(opensModal ? 1 : 0)
    expect(onCloseModal).toHaveBeenCalledTimes(opensModal ? 0 : 1)
  })
})
