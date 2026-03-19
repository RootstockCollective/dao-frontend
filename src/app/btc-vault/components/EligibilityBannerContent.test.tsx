import { afterEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EligibilityBannerContent } from './EligibilityBannerContent'

describe('EligibilityBannerContent', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders ELIGIBILITY header, Submit KYB button, and secondary link when variant is none', () => {
    const onSubmitKyb = vi.fn()
    const onCheckStatus = vi.fn()
    render(
      <EligibilityBannerContent variant="none" onSubmitKyb={onSubmitKyb} onCheckStatus={onCheckStatus} />,
    )

    expect(screen.getByText('ELIGIBILITY')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit KYB/ })).toBeInTheDocument()
    expect(
      screen.getByText('KYB already submitted? Check KYB status'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('EligibilityBannerContent')).toBeInTheDocument()
  })

  it('renders instructional text when variant is none', () => {
    render(
      <EligibilityBannerContent variant="none" onSubmitKyb={() => {}} onCheckStatus={() => {}} />,
    )

    const section = screen.getByTestId('EligibilityBannerContent')
    expect(
      within(section).getByText(
        /Deposits are locked until KYB is approved\. Submit KYB to unlock deposits once the review is complete\./,
      ),
    ).toBeInTheDocument()
  })

  it('renders Re-submit KYB, rejection message, and icon when variant is rejected', () => {
    render(
      <EligibilityBannerContent
        variant="rejected"
        onSubmitKyb={() => {}}
        onCheckStatus={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: /Re-submit KYB/ })).toBeInTheDocument()
    expect(
      screen.getByText(
        /We couldn't approve your KYB submission because of\.\.\. Update the information and resubmit to unlock deposits\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('EligibilityBannerRejectedIcon')).toBeInTheDocument()
    expect(screen.getByTestId('EligibilityBannerContent')).toBeInTheDocument()
  })

  it('uses rejectionReason in message when variant is rejected and rejectionReason provided', () => {
    render(
      <EligibilityBannerContent
        variant="rejected"
        rejectionReason="incomplete documentation"
        onSubmitKyb={() => {}}
        onCheckStatus={() => {}}
      />,
    )

    expect(
      screen.getByText(
        /We couldn't approve your KYB submission because of incomplete documentation\. Update the information and resubmit to unlock deposits\./,
      ),
    ).toBeInTheDocument()
  })

  it('calls onSubmitKyb when primary button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmitKyb = vi.fn()
    render(
      <EligibilityBannerContent variant="none" onSubmitKyb={onSubmitKyb} onCheckStatus={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: /Submit KYB/ }))

    expect(onSubmitKyb).toHaveBeenCalledTimes(1)
  })

  it('calls onCheckStatus when Check KYB status link is clicked', async () => {
    const user = userEvent.setup()
    const onCheckStatus = vi.fn()
    render(
      <EligibilityBannerContent variant="none" onSubmitKyb={() => {}} onCheckStatus={onCheckStatus} />,
    )

    await user.click(screen.getByText('KYB already submitted? Check KYB status'))

    expect(onCheckStatus).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmitKyb when Re-submit KYB is clicked in rejected variant', async () => {
    const user = userEvent.setup()
    const onSubmitKyb = vi.fn()
    render(
      <EligibilityBannerContent
        variant="rejected"
        onSubmitKyb={onSubmitKyb}
        onCheckStatus={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Re-submit KYB/ }))

    expect(onSubmitKyb).toHaveBeenCalledTimes(1)
  })
})
