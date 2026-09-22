import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

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

describe('IntroModalContent', () => {
  afterEach(cleanup)

  it('names the token the holder is missing, and how to get there', () => {
    render(<IntroModalContent tokenStatus="NEED_RIF" {...defaultProps} />)

    expect(screen.getByTestId('stake-title')).toHaveTextContent('Before you stake')
    expect(screen.getByTestId('stake-subtitle')).toHaveTextContent('add RIF to your wallet')

    const pair = screen.getByTestId('wallet-info-rif')
    expect(pair).toHaveTextContent('USD')
    expect(pair).toHaveTextContent('RIF')
    // The token mark sits right after the symbol; it is missing in the old design.
    expect(screen.getByAltText('RIF Logo')).toBeInTheDocument()

    expect(screen.getByText('You need RIF to stake')).toBeInTheDocument()
    expect(screen.queryByTestId('wallet-info-rbtc')).not.toBeInTheDocument()
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
