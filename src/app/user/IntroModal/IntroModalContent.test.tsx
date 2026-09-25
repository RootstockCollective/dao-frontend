import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { currentLinks } from '@/lib/links'

import { IntroModalContent } from './IntroModalContent'

const defaultProps = {
  onClose: vi.fn(),
  onContinue: vi.fn(),
}

/**
 * The artwork draws itself on a canvas, which jsdom does not implement. The component
 * already copes with a missing context; this only keeps the "not implemented" noise out
 * of the test output.
 */
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('IntroModalContent', () => {
  afterEach(cleanup)

  it('names the token the holder is missing, and how to get there', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    expect(screen.getByTestId('stake-title')).toHaveTextContent('Before you stake')
    expect(screen.getByTestId('stake-subtitle')).toHaveTextContent('add RIF to your wallet')

    const pair = screen.getByTestId('wallet-info-rif')
    expect(pair).toHaveTextContent('USD')
    expect(pair).toHaveTextContent('RIF')

    const mark = pair.querySelector('img')
    expect(mark).toBeInTheDocument()
    expect(mark).toHaveAttribute('alt', '')
    expect(screen.queryByAltText('RIF Logo')).not.toBeInTheDocument()

    expect(screen.getByText('You need RIF to stake')).toBeInTheDocument()
    expect(screen.queryByTestId('wallet-info-rbtc')).not.toBeInTheDocument()
  })

  it('opens under a testid that does not depend on the breakpoint', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    expect(screen.getByTestId('intro-modal')).toBeInTheDocument()
  })

  it('reads the two-line headline as one heading, not two', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    // The lines are one sentence. Two sibling headings would announce as two sections.
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Before you stake')
    expect(headings[0]).toHaveTextContent('add RIF to your wallet')
  })

  it('keeps the decorative arrow out of the pair it sits in', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    // Otherwise a screen reader announces "USD, Arrow Right Icon, RIF".
    const arrow = screen.getByTestId('wallet-info-rif').querySelector('svg')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows both pairs when neither token is held', () => {
    render(<IntroModalContent tokenStatus="NEED_RBTC_RIF" {...defaultProps} />)

    expect(screen.getByTestId('wallet-info-rbtc')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-info-rif')).toBeInTheDocument()
  })

  it('shows balances instead of pairs once the wallet is funded', () => {
    render(
      <IntroModalContent
        tokenStatus="NEED_STRIF"
        rbtcBalance="0.1234"
        rifBalance="543.21"
        {...defaultProps}
      />,
    )

    expect(screen.getByText(/0\.1234/)).toBeInTheDocument()
    expect(screen.getByText(/543\.21/)).toBeInTheDocument()
    expect(screen.queryByTestId('wallet-info-rif')).not.toBeInTheDocument()
  })

  // NEED_STRIF carries no wallet info, and a rule with nothing under it reads as a stray line.
  it('drops the rule and the copy under it when the state has nothing to say', () => {
    render(<IntroModalContent tokenStatus="NEED_STRIF" rbtcBalance="1" rifBalance="2" {...defaultProps} />)

    expect(screen.queryByTestId('ParagraphWalletInfo')).not.toBeInTheDocument()
  })

  it('keeps them wherever there is something to say', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    expect(screen.getByTestId('ParagraphWalletInfo')).toHaveTextContent('You need RIF to stake')
  })

  it('sends the holder off to buy the token they are missing', () => {
    const onContinue = vi.fn()
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} onContinue={onContinue} />)

    fireEvent.click(screen.getByTestId('intro-modal-continue-button'))

    expect(onContinue).toHaveBeenCalledWith(currentLinks.getRif, true)
  })

  it('keeps a funded holder inside the app', () => {
    const onContinue = vi.fn()
    render(<IntroModalContent tokenStatus="NEED_STRIF" {...defaultProps} onContinue={onContinue} />)

    fireEvent.click(screen.getByText('Continue to staking'))

    expect(onContinue).toHaveBeenCalledWith('/user?action=stake', false)
  })

  it('tucks the pixel mark inside the artwork', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    const pixels = screen.getByTestId('wallet-pixels')
    expect(pixels.children).toHaveLength(9)
    // Only three of the nine carry a fill, reading as a diagonal.
    const filled = Array.from(pixels.children).filter(cell => cell.className.includes('bg-'))
    expect(filled).toHaveLength(3)
  })
})
