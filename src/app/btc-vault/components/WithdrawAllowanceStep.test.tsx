import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WithdrawAllowanceStep } from './WithdrawAllowanceStep'

describe('WithdrawAllowanceStep', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders two-transaction copy and shares amount', () => {
    render(
      <WithdrawAllowanceStep
        sharesWei={2_000_000_000_000_000_000n}
        isAllowanceReadLoading={false}
        isApproving={false}
        isAllowanceTxFailed={false}
        onRequestAllowance={vi.fn().mockResolvedValue(undefined)}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByText(/two transactions/i)).toBeInTheDocument()
    expect(screen.getByTestId('AllowanceSharesAmount')).toHaveTextContent('2')
  })

  it('calls onRequestAllowance when Request allowance is clicked', async () => {
    const user = userEvent.setup()
    const onRequestAllowance = vi.fn().mockResolvedValue(undefined)
    render(
      <WithdrawAllowanceStep
        sharesWei={1n}
        isAllowanceReadLoading={false}
        isApproving={false}
        isAllowanceTxFailed={false}
        onRequestAllowance={onRequestAllowance}
        onBack={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('RequestAllowanceButton'))
    expect(onRequestAllowance).toHaveBeenCalledOnce()
  })
})
