import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ONE_DAY_IN_MS } from '@/lib/constants'
import { currentLinks } from '@/lib/links'

import { INTRO_MODAL_REMIND_AFTER_DAYS, IntroModalStatus } from './config'
import { IntroModal } from './IntroModal'

const WALLET_A = '0x00000000000000000000000000000000000000ab'
const WALLET_B = '0x00000000000000000000000000000000000000cd'

const mocks = vi.hoisted(() => ({
  address: '',
  tokenStatus: null as IntroModalStatus | null,
  push: vi.fn(),
}))

vi.mock('wagmi', () => ({ useAccount: () => ({ address: mocks.address }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('./hooks/useRequiredTokens', () => ({ useRequiredTokens: () => mocks.tokenStatus }))
vi.mock('../Balances/context/BalancesContext', async () => {
  const { RBTC, RIF } = await vi.importActual<typeof import('@/lib/constants')>('@/lib/constants')
  return {
    useBalancesContext: () => ({ balances: { [RBTC]: { balance: '0.1' }, [RIF]: { balance: '100' } } }),
  }
})

const NOW = new Date('2026-10-01T12:00:00Z').getTime()

const queryModal = () => screen.queryByTestId('intro-modal')

/** Remounting simulates a reload */
const reload = () => {
  cleanup()
  render(<IntroModal />)
}

describe('IntroModal', () => {
  beforeEach(() => {
    // jsdom has no canvas
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
    mocks.address = WALLET_A
    mocks.push.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('opens for a holder with a step ahead of them', () => {
    mocks.tokenStatus = 'NEED_RIF'
    render(<IntroModal />)

    expect(queryModal()).toBeInTheDocument()
  })

  it('stays out of the way once the holder has everything', () => {
    mocks.tokenStatus = null
    render(<IntroModal />)

    expect(queryModal()).not.toBeInTheDocument()
  })

  it('stays closed after a reload once the holder closes it', () => {
    mocks.tokenStatus = 'NEED_RIF'
    render(<IntroModal />)

    fireEvent.click(screen.getByTestId('CloseButton'))
    expect(queryModal()).not.toBeInTheDocument()

    reload()
    expect(queryModal()).not.toBeInTheDocument()
  })

  it('opens again as soon as the holder reaches a different step', () => {
    mocks.tokenStatus = 'NEED_RBTC_RIF'
    const { rerender } = render(<IntroModal />)
    fireEvent.click(screen.getByTestId('CloseButton'))

    // Balances are polled, so the step can change live
    mocks.tokenStatus = 'NEED_RIF'
    rerender(<IntroModal />)

    expect(queryModal()).toBeInTheDocument()
    expect(screen.getByTestId('stake-subtitle')).toHaveTextContent('add RIF to your wallet')
  })

  it('opens again on the same step once the reminder period is over', () => {
    mocks.tokenStatus = 'NEED_RIF'
    render(<IntroModal />)
    fireEvent.click(screen.getByTestId('CloseButton'))

    vi.setSystemTime(NOW + INTRO_MODAL_REMIND_AFTER_DAYS * ONE_DAY_IN_MS)
    reload()

    expect(queryModal()).toBeInTheDocument()
  })

  it('applies a dismissal to the wallet that closed it, also when switching wallets on the same step', () => {
    mocks.tokenStatus = 'NEED_RIF'
    const { rerender } = render(<IntroModal />)
    fireEvent.click(screen.getByTestId('CloseButton'))

    mocks.address = WALLET_B
    rerender(<IntroModal />)
    expect(queryModal()).toBeInTheDocument()

    mocks.address = WALLET_A
    rerender(<IntroModal />)
    expect(queryModal()).not.toBeInTheDocument()
  })

  it('counts heading to the staking flow as closing it, so backing out does not bring it back', () => {
    mocks.tokenStatus = 'NEED_STRIF'
    render(<IntroModal />)

    fireEvent.click(screen.getByTestId('intro-modal-continue-button'))
    expect(mocks.push).toHaveBeenCalledWith('/user?action=stake')
    expect(queryModal()).not.toBeInTheDocument()

    reload()
    expect(queryModal()).not.toBeInTheDocument()
  })

  it('stays open while the holder visits a provider, and keeps showing after a reload', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    mocks.tokenStatus = 'NEED_RIF'
    render(<IntroModal />)

    fireEvent.click(screen.getByTestId('intro-modal-continue-button'))
    expect(open).toHaveBeenCalledWith(currentLinks.getRif, '_blank', 'noopener,noreferrer')
    expect(queryModal()).toBeInTheDocument()

    reload()
    expect(queryModal()).toBeInTheDocument()
  })
})
