import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageBanner } from './PageBanner'

const renderBanner = (props = {}) =>
  render(<PageBanner dismissible title="Treasury" imageSrc="/images/test.webp" {...props} />)

describe('PageBanner', () => {
  afterEach(cleanup)

  it('renders a title-only banner', () => {
    renderBanner()

    expect(screen.getByText('Treasury')).toBeInTheDocument()
    expect(screen.getByTestId('PageBanner')).toBeInTheDocument()
  })

  it('renders the description, the eyebrow and the bottom right slot when given', () => {
    renderBanner({
      eyebrow: 'Build on Rootstock',
      description: 'Some intro copy.',
      bottomRight: <span>See the Whitepaper</span>,
    })

    expect(screen.getByText('Build on Rootstock')).toBeInTheDocument()
    expect(screen.getByText('Some intro copy.')).toBeInTheDocument()
    expect(screen.getByText('See the Whitepaper')).toBeInTheDocument()
  })

  it('hides the banner when dismissed, without persisting the choice', () => {
    renderBanner()

    fireEvent.click(screen.getByTestId('DismissBannerButton'))

    expect(screen.queryByTestId('PageBanner')).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toHaveLength(0)
  })

  it('comes back on the next page load', () => {
    const { unmount } = renderBanner()
    fireEvent.click(screen.getByTestId('DismissBannerButton'))
    unmount()

    renderBanner()
    expect(screen.getByTestId('PageBanner')).toBeInTheDocument()
  })

  it('renders no dismiss button when it is not dismissible', () => {
    render(<PageBanner title="Holdings" imageSrc="/images/test.webp" />)

    expect(screen.getByText('Holdings')).toBeInTheDocument()
    expect(screen.queryByTestId('DismissBannerButton')).not.toBeInTheDocument()
  })
})
