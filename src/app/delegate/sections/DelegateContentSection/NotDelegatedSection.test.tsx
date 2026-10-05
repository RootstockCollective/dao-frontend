import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'

import { NotDelegatedSection } from './NotDelegatedSection'

const mocks = vi.hoisted(() => ({ push: vi.fn(), rifBalance: '0', isBalancesLoading: false }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({
    balances: { [RIF]: { balance: mocks.rifBalance } },
    isBalancesLoading: mocks.isBalancesLoading,
  }),
}))

type Props = Parameters<typeof NotDelegatedSection>[0]

const renderSection = (props: Partial<Props> = {}) => {
  const onActivate = vi.fn()
  render(<NotDelegatedSection hasStRif={false} isActivating={false} onActivate={onActivate} {...props} />)
  return { onActivate, button: screen.getByTestId('NotDelegatedButton') }
}

describe('NotDelegatedSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rifBalance = '0'
    mocks.isBalancesLoading = false
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('tells the holder they have not delegated yet', () => {
    renderSection()

    expect(screen.getByTestId('NotDelegatedSection')).toHaveTextContent(
      "You haven't delegated your voting power yet.",
    )
  })

  describe('without stRIF', () => {
    it('sends a RIF holder to stake', () => {
      mocks.rifBalance = '12.5'
      const { button, onActivate } = renderSection()

      expect(button).toHaveTextContent('Stake RIF')
      fireEvent.click(button)

      expect(mocks.push).toHaveBeenCalledWith('/user?action=stake')
      expect(onActivate).not.toHaveBeenCalled()
    })

    it('points someone without RIF to where to get it', () => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null)
      const { button } = renderSection()

      expect(button).toHaveTextContent('Get RIF')
      fireEvent.click(button)

      expect(open).toHaveBeenCalledWith(currentLinks.getRif, '_blank', 'noopener,noreferrer')
      expect(mocks.push).not.toHaveBeenCalled()
    })

    it('waits for the RIF balance instead of offering "Get RIF" to a RIF holder', () => {
      mocks.isBalancesLoading = true

      render(<NotDelegatedSection hasStRif={false} isActivating={false} onActivate={vi.fn()} />)

      expect(screen.queryByTestId('NotDelegatedSection')).not.toBeInTheDocument()
    })
  })

  describe('with stRIF', () => {
    it('activates the voting power', () => {
      const { button, onActivate } = renderSection({ hasStRif: true })

      expect(button).toHaveTextContent('Activate voting power')
      fireEvent.click(button)

      expect(onActivate).toHaveBeenCalledTimes(1)
    })

    it('does not wait for the RIF balance, which it does not need', () => {
      mocks.isBalancesLoading = true

      const { button } = renderSection({ hasStRif: true })

      expect(button).toHaveTextContent('Activate voting power')
    })

    it('cannot be activated twice while the transaction is pending', () => {
      const { button, onActivate } = renderSection({ hasStRif: true, isActivating: true })

      expect(button).toHaveTextContent('Activating...')
      expect(button).toBeDisabled()
      fireEvent.click(button)

      expect(onActivate).not.toHaveBeenCalled()
    })
  })
})
