import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'

import { NoVotingPowerSection } from './NoVotingPowerSection'

const mocks = vi.hoisted(() => ({ push: vi.fn(), rifBalance: '0', isBalancesLoading: false }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({
    balances: { [RIF]: { balance: mocks.rifBalance } },
    isBalancesLoading: mocks.isBalancesLoading,
  }),
}))

describe('NoVotingPowerSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rifBalance = '0'
    mocks.isBalancesLoading = false
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('tells the account it has no voting power yet', () => {
    render(<NoVotingPowerSection />)

    expect(screen.getByTestId('NoVotingPowerSection')).toHaveTextContent("You don't have voting power yet.")
    expect(screen.getByTestId('NoVotingPowerSection')).toHaveTextContent(
      'Stake RIF to get voting power and take part in governance.',
    )
  })

  it('sends a RIF holder to stake', () => {
    mocks.rifBalance = '12.5'
    render(<NoVotingPowerSection />)
    const button = screen.getByTestId('NoVotingPowerButton')

    expect(button).toHaveTextContent('Stake RIF')
    fireEvent.click(button)

    expect(mocks.push).toHaveBeenCalledWith('/user?action=stake')
  })

  it('points someone without RIF to where to get it', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<NoVotingPowerSection />)
    const button = screen.getByTestId('NoVotingPowerButton')

    expect(button).toHaveTextContent('Get RIF')
    fireEvent.click(button)

    expect(open).toHaveBeenCalledWith(currentLinks.getRif, '_blank', 'noopener,noreferrer')
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('waits for the RIF balance instead of offering "Get RIF" to a RIF holder', () => {
    mocks.isBalancesLoading = true

    render(<NoVotingPowerSection />)

    expect(screen.queryByTestId('NoVotingPowerSection')).not.toBeInTheDocument()
  })
})
