import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { EligibilityIndicator } from './EligibilityIndicator'
import type { ActionEligibility } from '../services/ui/types'

describe('EligibilityIndicator', () => {
  afterEach(cleanup)

  it('renders "KYB: Approved" when no block reasons', () => {
    const eligibility: ActionEligibility = {
      canDeposit: true,
      canWithdraw: true,
      depositBlockReason: '',
      withdrawBlockReason: '',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByTestId('EligibilityIndicator')).toBeInTheDocument()
    expect(screen.getByText('KYB: Approved')).toBeInTheDocument()
  })

  it('renders "KYB: Not Authorized" when user is ineligible', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: false,
      depositBlockReason: 'KYC required',
      withdrawBlockReason: '',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByText('KYB: Not Authorized')).toBeInTheDocument()
  })

  it('renders combined "KYB: Approved | Deposits: Paused" when deposits are paused', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: true,
      depositBlockReason: 'Deposits are currently paused',
      withdrawBlockReason: '',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByText('KYB: Approved | Deposits: Paused')).toBeInTheDocument()
  })

  it('renders combined "KYB: Approved | Withdrawals: Paused" when withdrawals are paused', () => {
    const eligibility: ActionEligibility = {
      canDeposit: true,
      canWithdraw: false,
      depositBlockReason: '',
      withdrawBlockReason: 'Withdrawals are currently paused',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByText('KYB: Approved | Withdrawals: Paused')).toBeInTheDocument()
  })

  it('renders "KYB: Approved | Vault: Paused" when both are paused', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: false,
      depositBlockReason: 'Deposits are currently paused',
      withdrawBlockReason: 'Withdrawals are currently paused',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByText('KYB: Approved | Vault: Paused')).toBeInTheDocument()
  })

  it('renders "KYB: Approved" when blocked only by active request', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: false,
      depositBlockReason: 'You already have an active request',
      withdrawBlockReason: 'You already have an active request',
    }
    render(<EligibilityIndicator eligibility={eligibility} />)

    expect(screen.getByText('KYB: Approved')).toBeInTheDocument()
  })
})
