import { cleanup, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { parseEther } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { AbiBoostPositionState } from '../hooks/useAbiBoost'
import { StakeBoostEligibilityRow, StakeBoostNotice } from './StakeBoost'

const mockPosition = vi.fn<() => AbiBoostPositionState>()

vi.mock('../hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => true,
  useAbiBoostPosition: () => mockPosition(),
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

const holding = (stRif: string, backing = '0'): AbiBoostPositionState => ({
  stRifBalance: parseEther(stRif),
  backing: parseEther(backing),
  status: 'notEligible',
  isLoading: false,
})

afterEach(cleanup)

describe('StakeBoostNotice', () => {
  it('shows the current ABI', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('CurrentAbiRate').textContent).toBe('5.0%')
  })

  it('keeps the approved copy for a wallet with nothing staked', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      'Stake 100,000 RIF or more to unlock a +7.5% boost when you back Builders.',
    )
  })

  it('counts the stRIF already held in what is left to stake', () => {
    mockPosition.mockReturnValue(holding('60000'))
    render(<StakeBoostNotice amount="10000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      'Stake 40,000 RIF or more to unlock a +7.5% boost when you back Builders.',
    )
  })

  it('announces the eligibility once the amount reaches the minimum', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostNotice amount="100000" />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toBe(
      "You'll be eligible for a +7.5% boost. Back a Builder after staking to switch it on.",
    )
  })

  it('tolerates an amount mid-edit', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostNotice amount="." />)
    expect(screen.getByTestId('StakeBoostMessage').textContent).toContain('Stake 100,000 RIF or more')
  })
})

describe('StakeBoostEligibilityRow', () => {
  it('confirms the boost will switch on once backing a Builder', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostEligibilityRow amount="100000" />)
    expect(screen.getByTestId('StakeBoostEligibilityRow').textContent).toContain(
      'Eligible for +7.5%, once backing a Builder',
    )
  })

  it('flags a stake that stays under the minimum', () => {
    mockPosition.mockReturnValue(holding('0'))
    render(<StakeBoostEligibilityRow amount="10000" />)
    expect(screen.getByTestId('BelowThresholdTag').textContent).toBe(
      'Below eligibility threshold, not earning boost',
    )
  })

  it('reports a boost that is already running', () => {
    mockPosition.mockReturnValue(holding('150000', '150000'))
    render(<StakeBoostEligibilityRow amount="5000" />)
    expect(screen.getByTestId('StakeBoostEligibilityRow').textContent).toContain(
      'Active, +7.5% on your backing',
    )
  })
})
