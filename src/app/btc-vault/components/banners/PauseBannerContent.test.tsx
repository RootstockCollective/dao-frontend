import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BOTH_PAUSED_REASON, DEPOSIT_PAUSED_REASON, WITHDRAWAL_PAUSED_REASON } from '../../services/constants'
import { PauseBannerContent } from './PauseBannerContent'

describe('PauseBannerContent', () => {
  afterEach(cleanup)

  it('shows deposit paused message when only deposits are paused', () => {
    render(<PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'active' }} />)

    expect(screen.getByText(DEPOSIT_PAUSED_REASON)).toBeInTheDocument()
    expect(screen.queryByText(BOTH_PAUSED_REASON)).not.toBeInTheDocument()
  })

  it('shows withdrawal paused message when only withdrawals are paused', () => {
    render(<PauseBannerContent pauseState={{ deposits: 'active', withdrawals: 'paused' }} />)

    expect(screen.getByText(WITHDRAWAL_PAUSED_REASON)).toBeInTheDocument()
    expect(screen.queryByText(BOTH_PAUSED_REASON)).not.toBeInTheDocument()
  })

  it('shows combined message when both are paused', () => {
    render(<PauseBannerContent pauseState={{ deposits: 'paused', withdrawals: 'paused' }} />)

    expect(screen.getByText(BOTH_PAUSED_REASON)).toBeInTheDocument()
    expect(screen.queryByText(DEPOSIT_PAUSED_REASON)).not.toBeInTheDocument()
    expect(screen.queryByText(WITHDRAWAL_PAUSED_REASON)).not.toBeInTheDocument()
  })
})
