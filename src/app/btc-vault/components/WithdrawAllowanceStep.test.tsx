import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import { WithdrawAllowanceStep } from './WithdrawAllowanceStep'

const TWO_SHARES_RAW = 2n * WeiPerEther * VAULT_SHARE_MULTIPLIER

describe('WithdrawAllowanceStep', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders two-transaction copy and shares amount', () => {
    render(
      <WithdrawAllowanceStep
        sharesWei={TWO_SHARES_RAW}
        sharesDisplayAmount="2"
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

  it('shows precise sharesDisplayAmount for small balances instead of <0.01', () => {
    const smallSharesRaw = 124008768643060800082n
    const display = '0.00012400876864306'
    render(
      <WithdrawAllowanceStep
        sharesWei={smallSharesRaw}
        sharesDisplayAmount={display}
        isAllowanceReadLoading={false}
        isApproving={false}
        isAllowanceTxFailed={false}
        onRequestAllowance={vi.fn().mockResolvedValue(undefined)}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByTestId('AllowanceSharesAmount')).toHaveTextContent(display)
    expect(screen.getByTestId('AllowanceSharesAmount')).not.toHaveTextContent('<0.01')
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
