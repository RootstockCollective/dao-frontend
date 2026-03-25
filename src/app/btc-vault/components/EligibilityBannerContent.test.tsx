import { afterEach, describe, expect, it } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { EligibilityBannerContent } from './EligibilityBannerContent'

describe('EligibilityBannerContent', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders ELIGIBILITY header, Submit KYB link, and check status text when variant is none', () => {
    render(<EligibilityBannerContent variant="none" />)

    expect(screen.getByText('ELIGIBILITY')).toBeInTheDocument()
    expect(screen.getByText('Submit KYB')).toBeInTheDocument()
    expect(
      screen.getByText('KYB already submitted? Check KYB status in the designated KYB portal'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
  })

  it('renders instructional text when variant is none', () => {
    render(<EligibilityBannerContent variant="none" />)

    const section = screen.getByTestId('eligibility-banner-content')
    expect(
      section.textContent?.includes(
        'Deposits are locked until KYB is approved. Submit KYB to unlock deposits once the review is complete.',
      ),
    ).toBe(true)
  })

  it('links Submit KYB to the institutional portal in a new tab', () => {
    render(<EligibilityBannerContent variant="none" />)

    const link = screen.getByTestId('eligibility-banner-submit-kyb')
    expect(link).toHaveAttribute('href', 'https://www.rootstocklabs.com/institutional/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders check status as plain text without a link when variant is none', () => {
    render(<EligibilityBannerContent variant="none" />)

    const checkStatus = screen.getByTestId('eligibility-banner-check-status')
    expect(checkStatus.tagName).not.toBe('A')
    expect(checkStatus).not.toHaveAttribute('href')
  })

  it('renders Re-submit KYB, rejection message, and icon when variant is rejected', () => {
    render(<EligibilityBannerContent variant="rejected" />)

    expect(screen.getByText('Re-submit KYB')).toBeInTheDocument()
    expect(
      screen.getByText(
        /We couldn't approve your KYB submission because of\.\.\. Update the information and resubmit to unlock deposits\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-rejected-icon')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
  })

  it('uses rejectionReason in message when variant is rejected and rejectionReason provided', () => {
    render(<EligibilityBannerContent variant="rejected" rejectionReason="incomplete documentation" />)

    expect(
      screen.getByText(
        /We couldn't approve your KYB submission because of incomplete documentation\. Update the information and resubmit to unlock deposits\./,
      ),
    ).toBeInTheDocument()
  })

  it('links Re-submit KYB to the institutional portal in a new tab', () => {
    render(<EligibilityBannerContent variant="rejected" />)

    const link = screen.getByTestId('eligibility-banner-submit-kyb')
    expect(link).toHaveAttribute('href', 'https://www.rootstocklabs.com/institutional/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
