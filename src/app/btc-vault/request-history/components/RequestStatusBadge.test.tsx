import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { RequestStatusBadge } from './RequestStatusBadge'

afterEach(() => {
  cleanup()
})

describe('RequestStatusBadge', () => {
  it('renders approved label', () => {
    render(<RequestStatusBadge displayStatus="approved" label="Approved" />)
    expect(screen.getByTestId('request-status-badge')).toHaveTextContent('Approved')
  })

  it('renders withdrawal-ready label for claim_pending', () => {
    render(<RequestStatusBadge displayStatus="claim_pending" label="Ready to withdraw" />)
    expect(screen.getByTestId('request-status-badge')).toHaveTextContent('Ready to withdraw')
  })

  it('renders withdrawn label for successful withdrawal row', () => {
    render(<RequestStatusBadge displayStatus="successful" label="Withdrawn" />)
    expect(screen.getByTestId('request-status-badge')).toHaveTextContent('Withdrawn')
  })
})
