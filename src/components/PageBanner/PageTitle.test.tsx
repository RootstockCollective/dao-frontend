import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageTitle } from './PageTitle'

describe('PageTitle', () => {
  afterEach(cleanup)

  it('renders the page heading', () => {
    render(<PageTitle dataTestId="StakingHistoryHeader">Staking History</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1, name: 'Staking History' })
    expect(heading).toHaveAttribute('data-testid', 'StakingHistoryHeader')
  })
})
