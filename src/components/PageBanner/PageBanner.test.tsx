import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageBanner } from './PageBanner'

const renderBanner = (props = {}) => render(<PageBanner title="Treasury" {...props} />)

describe('PageBanner', () => {
  afterEach(cleanup)

  it('renders a title-only banner', () => {
    renderBanner()

    expect(screen.getByRole('heading', { level: 1, name: 'Treasury' })).toBeInTheDocument()
    expect(screen.getByTestId('PageBanner')).toBeInTheDocument()
  })

  it('renders the description and the bottom right slot when given', () => {
    renderBanner({
      description: 'Some intro copy.',
      bottomRight: <span>See the Whitepaper</span>,
    })

    expect(screen.getByText('Some intro copy.')).toBeInTheDocument()
    expect(screen.getByText('See the Whitepaper')).toBeInTheDocument()
  })

  it('uses the compact layout only when the banner carries just the title', () => {
    const { rerender } = renderBanner()
    expect(screen.getByTestId('PageBanner').querySelector('[data-compact]')).toHaveAttribute('data-compact', 'true')

    rerender(<PageBanner title="Treasury" description="Some intro copy." />)
    expect(screen.getByTestId('PageBanner').querySelector('[data-compact]')).toHaveAttribute('data-compact', 'false')
  })

  it('cannot be dismissed', () => {
    renderBanner()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
