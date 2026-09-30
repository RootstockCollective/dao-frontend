import { cleanup, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { StakeBoostNotice, StakeBoostSummary } from './StakeBoost'

vi.mock('../hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => true,
}))

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

afterEach(cleanup)

const BELOW = 'Stake 100,000 RIF or more to unlock a +7.5% boost when you back Builders.'
const ELIGIBLE = "You'll be eligible for a +7.5% boost. Back a Builder after staking to switch it on."

describe('StakeBoostNotice', () => {
  it('shows the current ABI', () => {
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('CurrentAbiRate').textContent).toBe('5.0%')
  })

  it('asks for the minimum while the amount typed is under it', () => {
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(BELOW)
  })

  it('switches to the eligibility message once the amount reaches the minimum', () => {
    const { rerender } = render(<StakeBoostNotice amount="10000" />)
    rerender(<StakeBoostNotice amount="100000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(ELIGIBLE)
  })

  it('tolerates an amount mid-edit', () => {
    render(<StakeBoostNotice amount="." />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(BELOW)
  })
})

describe('StakeBoostSummary', () => {
  it('reviews the stake as the design does: amount, what it becomes, eligibility', () => {
    render(<StakeBoostSummary amount="100000" fromSymbol="RIF" toSymbol="stRIF" />)
    const summary = screen.getByTestId('StakeBoostSummary').textContent
    expect(summary).toContain('Amount100,000 RIF')
    expect(summary).toContain('Becomes100,000 stRIF')
    expect(screen.getByTestId('StakeBoostEligibility').textContent).toBe(
      'Eligible for +7.5%, once backing a Builder',
    )
  })

  it('flags a stake under the minimum', () => {
    render(<StakeBoostSummary amount="10000" fromSymbol="RIF" toSymbol="stRIF" />)
    expect(screen.getByTestId('BelowThresholdTag').textContent).toBe(
      'Below eligibility threshold, not earning boost',
    )
  })
})
