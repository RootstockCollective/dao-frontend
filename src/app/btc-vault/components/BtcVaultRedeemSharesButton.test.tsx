import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS } from '../constants'
import { BtcVaultRedeemSharesButton } from './BtcVaultRedeemSharesButton'

const mockUseAccount = vi.fn()
const mockExecuteTxFlow = vi.fn()
const mockClaim = vi.fn()
const mockUseClaimRequest = vi.fn()
const mockInvalidateAfterAction = vi.fn()
const mockOnAfterRedeemRefetch = vi.fn()

function TestWrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useBtcVaultInvalidation', () => ({
  useBtcVaultInvalidation: () => ({
    invalidateAfterSubmit: vi.fn(),
    invalidateAfterAction: mockInvalidateAfterAction,
  }),
}))

vi.mock('../hooks/useClaimRequest', () => ({
  useClaimRequest: (...args: unknown[]) => mockUseClaimRequest(...args),
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: (args: unknown) => mockExecuteTxFlow(args),
}))

const TWO_SHARES_RAW = 2n * WeiPerEther * VAULT_SHARE_MULTIPLIER

const MOCK_CLAIMABLE_WITHDRAWAL = {
  id: 'red-2',
  type: 'withdrawal' as const,
  amount: TWO_SHARES_RAW,
  status: 'claimable' as const,
  epochId: null,
  batchRedeemId: '2',
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'a'.repeat(64) },
}

describe('BtcVaultRedeemSharesButton', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      isRequesting: false,
      isTxPending: false,
      isReadingAmount: false,
      isReadingError: false,
    })
    mockExecuteTxFlow.mockResolvedValue(undefined)
    mockClaim.mockResolvedValue('0xclaimhash')
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders nothing when wallet has no address', () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { container } = render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when vaultRequest is null', () => {
    const { container } = render(<BtcVaultRedeemSharesButton vaultRequest={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when vaultRequest is not a claimable withdrawal', () => {
    const { container } = render(
      <BtcVaultRedeemSharesButton
        vaultRequest={{
          ...MOCK_CLAIMABLE_WITHDRAWAL,
          status: 'pending',
        }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when on-chain claimable amount is zero', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: false,
      isRequesting: false,
      isTxPending: false,
      isReadingAmount: false,
      isReadingError: false,
    })
    const { container } = render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing while reading claimable amount', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: false,
      isRequesting: false,
      isTxPending: false,
      isReadingAmount: true,
      isReadingError: false,
    })
    const { container } = render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when claimable read errors', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: false,
      isRequesting: false,
      isTxPending: false,
      isReadingAmount: false,
      isReadingError: true,
    })
    const { container } = render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows Redeeming… while executeTxFlow is pending even if wagmi flags are false', async () => {
    mockExecuteTxFlow.mockImplementation(() => new Promise(() => {}))
    render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />, {
      wrapper: TestWrapper,
    })
    const btn = screen.getByTestId('btc-vault-redeem-shares-button')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByTestId('btc-vault-redeem-shares-button')).toHaveTextContent('Redeeming...')
    })
    const redeemingBtn = screen.getByTestId('btc-vault-redeem-shares-button') as HTMLButtonElement
    expect(redeemingBtn.disabled).toBe(false)
    expect(redeemingBtn).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows Redeeming… with tooltip path when finalize tx in progress', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      isRequesting: true,
      isTxPending: false,
      isReadingAmount: false,
      isReadingError: false,
    })
    render(<BtcVaultRedeemSharesButton vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL} />, {
      wrapper: TestWrapper,
    })
    const btn = screen.getByTestId('btc-vault-redeem-shares-button') as HTMLButtonElement
    expect(btn).toHaveTextContent('Redeeming...')
    expect(btn.disabled).toBe(false)
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(btn)
    expect(mockExecuteTxFlow).not.toHaveBeenCalled()
  })

  it('does not invoke executeTxFlow twice on rapid double-click', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    mockExecuteTxFlow.mockImplementation(() => gate)
    render(
      <BtcVaultRedeemSharesButton
        vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL}
        onAfterRedeemRefetch={mockOnAfterRedeemRefetch}
      />,
      { wrapper: TestWrapper },
    )
    const btn = screen.getByTestId('btc-vault-redeem-shares-button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(mockExecuteTxFlow).toHaveBeenCalledTimes(1)
    release()
    await waitFor(() => expect(mockExecuteTxFlow).toHaveBeenCalledTimes(1))
  })

  it('shows Redeem Shares and calls executeTxFlow with btcVaultClaim on click', async () => {
    render(
      <BtcVaultRedeemSharesButton
        vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL}
        onAfterRedeemRefetch={mockOnAfterRedeemRefetch}
      />,
      { wrapper: TestWrapper },
    )

    expect(screen.getByTestId('btc-vault-redeem-shares-button')).toHaveTextContent('Redeem Shares')
    fireEvent.click(screen.getByTestId('btc-vault-redeem-shares-button'))

    await waitFor(() => {
      expect(mockExecuteTxFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'btcVaultClaim',
        }),
      )
    })
    const call = mockExecuteTxFlow.mock.calls[0][0] as {
      onRequestTx: () => Promise<unknown>
      onSuccess: () => Promise<void>
    }
    await call.onRequestTx()
    expect(mockClaim).toHaveBeenCalled()
  })

  it('onSuccess invalidates cache and refetches', async () => {
    vi.useFakeTimers()
    mockExecuteTxFlow.mockImplementation(
      async ({ onSuccess }: { onSuccess?: () => Promise<void> }) => {
        await onSuccess?.()
      },
    )
    render(
      <BtcVaultRedeemSharesButton
        vaultRequest={MOCK_CLAIMABLE_WITHDRAWAL}
        onAfterRedeemRefetch={mockOnAfterRedeemRefetch}
      />,
      { wrapper: TestWrapper },
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('btc-vault-redeem-shares-button'))
      await Promise.resolve()
      await vi.advanceTimersByTimeAsync(BTC_VAULT_BACKEND_INDEX_DELAY_MS)
    })

    expect(mockInvalidateAfterAction).toHaveBeenCalledWith('red-2')
    expect(mockOnAfterRedeemRefetch).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
