import { cleanup, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { AbiBoostPositionState } from '../hooks/useAbiBoost'
import { StakeBoostNotice, StakeBoostSummary } from './StakeBoost'

const mockPosition = vi.fn<() => AbiBoostPositionState>()

vi.mock('../hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => true,
  useAbiBoostPosition: () => mockPosition(),
}))

// The status is not read by the stake outlook, which derives it from the balance and the backing
const position = (stRif: string, backing = '0', isReady = true): AbiBoostPositionState => ({
  stRifBalance: parseEther(stRif),
  backing: parseEther(backing),
  status: 'notEligible',
  isReady,
})

vi.mock('@/app/shared/components/AnnualBackersIncentivesLoader', () => ({
  AnnualBackerIncentivesLoader: ({
    render,
  }: {
    render: (p: { data: Big; isLoading: boolean }) => ReactNode
  }) => render({ data: Big(5), isLoading: false }),
}))

vi.mock('@/components/IconButton/InfoIconButton', () => ({
  InfoIconButton: () => null,
}))

beforeEach(() => mockPosition.mockReturnValue(position('0')))

afterEach(cleanup)

const BELOW = 'Stake 100,000 RIF or more to unlock a +7.5% boost when you back Builders.'
const ELIGIBLE = "You'll be eligible for a +7.5% boost. Back a Builder after staking to switch it on."

describe('StakeBoostNotice', () => {
  it('shows the current ABI', () => {
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('CurrentAbiRate').textContent).toBe('5.0%')
  })

  it('asks a wallet with no stRIF for the minimum while the amount typed is under it', () => {
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(BELOW)
  })

  it('switches to the eligibility message once the amount reaches the minimum', () => {
    const { rerender } = render(<StakeBoostNotice amount="10000" />)
    rerender(<StakeBoostNotice amount="100000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(ELIGIBLE)
  })

  it('counts the stRIF the wallet already holds', () => {
    mockPosition.mockReturnValue(position('60000'))
    const { rerender } = render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      'Stake 40,000 RIF or more to unlock a +7.5% boost when you back Builders.',
    )
    rerender(<StakeBoostNotice amount="40000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(ELIGIBLE)
  })

  it('tells an eligible wallet it already is, and a boosted one that its boost runs', () => {
    mockPosition.mockReturnValue(position('150000'))
    const { rerender } = render(<StakeBoostNotice amount="10" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      "You're eligible for a +7.5% boost. Back Builders with 100,000 stRIF or more to switch it on.",
    )

    mockPosition.mockReturnValue(position('150000', '120000'))
    rerender(<StakeBoostNotice amount="11" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      'Your +7.5% boost is already active on your backing.',
    )
  })

  it('waits for the position before judging the amount', () => {
    mockPosition.mockReturnValue(position('60000', '0', false))
    render(<StakeBoostNotice amount="40000" />)
    expect(screen.queryByTestId('StakeBoostMessage')).toBeNull()
  })

  it('tolerates an amount mid-edit', () => {
    render(<StakeBoostNotice amount="." />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(BELOW)
  })
})

describe('StakeBoostSummary', () => {
  it('reviews the stake as the design does: amount, what it becomes, eligibility', () => {
    render(
      <StakeBoostSummary
        amount="100000"
        fromSymbol="RIF"
        toSymbol="stRIF"
        amountInCurrency="$4,500.00 USD"
      />,
    )
    const summary = screen.getByTestId('StakeBoostSummary').textContent
    expect(summary).toContain('Amount100,000 RIF$4,500.00 USD')
    expect(summary).toContain('Becomes100,000 stRIF')
    expect(screen.getByTestId('StakeBoostEligibility').textContent).toBe(
      'Eligible for +7.5%, once backing a Builder',
    )
  })

  it('flags a stake that leaves the wallet under the minimum', () => {
    render(<StakeBoostSummary amount="10000" fromSymbol="RIF" toSymbol="stRIF" />)
    expect(screen.getByTestId('BelowThresholdTag').textContent).toBe(
      'Below eligibility threshold, not earning boost',
    )
  })

  it('does not flag a small stake that the stRIF already held takes over the minimum', () => {
    mockPosition.mockReturnValue(position('60000'))
    render(<StakeBoostSummary amount="40000" fromSymbol="RIF" toSymbol="stRIF" />)
    expect(screen.queryByTestId('BelowThresholdTag')).toBeNull()
    expect(screen.getByTestId('StakeBoostEligibility').textContent).toBe(
      'Eligible for +7.5%, once backing a Builder',
    )
  })

  it('shows a boost that is already running', () => {
    mockPosition.mockReturnValue(position('150000', '120000'))
    render(<StakeBoostSummary amount="10" fromSymbol="RIF" toSymbol="stRIF" />)
    expect(screen.getByTestId('StakeBoostEligibility').textContent).toBe('Boost active · +7.5%')
  })
})
