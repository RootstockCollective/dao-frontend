import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS } from '../constants'
import { BtcVaultClaimSharesButton } from './BtcVaultClaimSharesButton'

const mockUseAccount = vi.fn()
const mockExecuteTxFlow = vi.fn()
const mockClaim = vi.fn()
const mockUseClaimRequest = vi.fn()
const mockInvalidateAfterAction = vi.fn()
const mockOnAfterClaimRefetch = vi.fn()

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

const ONE_BTC = 10n ** 18n

const MOCK_CLAIMABLE_DEPOSIT = {
  id: 'dep-1',
  type: 'deposit' as const,
  amount: ONE_BTC,
  status: 'claimable' as const,
  epochId: '1',
  batchRedeemId: null,
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'a'.repeat(64) },
}

describe('BtcVaultClaimSharesButton', () => {
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
    const { container } = render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when vaultRequest is null', () => {
    const { container } = render(<BtcVaultClaimSharesButton vaultRequest={null} />)
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
    const { container } = render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />)
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
    const { container } = render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />)
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
    const { container } = render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows Claiming… while executeTxFlow is pending even if wagmi flags are false', async () => {
    mockExecuteTxFlow.mockImplementation(() => new Promise(() => {}))
    render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />, {
      wrapper: TestWrapper,
    })
    const btn = screen.getByTestId('btc-vault-claim-shares-button')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByTestId('btc-vault-claim-shares-button')).toHaveTextContent('Claiming...')
    })
    const claimingBtn = screen.getByTestId('btc-vault-claim-shares-button') as HTMLButtonElement
    expect(claimingBtn.disabled).toBe(false)
    expect(claimingBtn).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows inert Claiming… (primary look) with tooltip when claim tx in progress (isRequesting)', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      isRequesting: true,
      isTxPending: false,
      isReadingAmount: false,
      isReadingError: false,
    })
    render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />, {
      wrapper: TestWrapper,
    })
    const btn = screen.getByTestId('btc-vault-claim-shares-button') as HTMLButtonElement
    expect(btn).toHaveTextContent('Claiming...')
    expect(btn.disabled).toBe(false)
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(btn)
    expect(mockExecuteTxFlow).not.toHaveBeenCalled()
  })

  it('shows inert Claiming… (primary look) when only isTxPending', () => {
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      isRequesting: false,
      isTxPending: true,
      isReadingAmount: false,
      isReadingError: false,
    })
    render(<BtcVaultClaimSharesButton vaultRequest={MOCK_CLAIMABLE_DEPOSIT} />, {
      wrapper: TestWrapper,
    })
    const btn = screen.getByTestId('btc-vault-claim-shares-button') as HTMLButtonElement
    expect(btn).toHaveTextContent('Claiming...')
    expect(btn.disabled).toBe(false)
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not invoke executeTxFlow twice on rapid double-click', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    mockExecuteTxFlow.mockImplementation(() => gate)
    render(
      <BtcVaultClaimSharesButton
        vaultRequest={MOCK_CLAIMABLE_DEPOSIT}
        onAfterClaimRefetch={mockOnAfterClaimRefetch}
      />,
      { wrapper: TestWrapper },
    )
    const btn = screen.getByTestId('btc-vault-claim-shares-button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(mockExecuteTxFlow).toHaveBeenCalledTimes(1)
    release()
    await waitFor(() => expect(mockExecuteTxFlow).toHaveBeenCalledTimes(1))
  })

  it('shows Claim Shares and calls executeTxFlow with btcVaultClaim on click', async () => {
    render(
      <BtcVaultClaimSharesButton
        vaultRequest={MOCK_CLAIMABLE_DEPOSIT}
        onAfterClaimRefetch={mockOnAfterClaimRefetch}
      />,
      { wrapper: TestWrapper },
    )

    expect(screen.getByTestId('btc-vault-claim-shares-button')).toHaveTextContent('Claim Shares')
    fireEvent.click(screen.getByTestId('btc-vault-claim-shares-button'))

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
      <BtcVaultClaimSharesButton
        vaultRequest={MOCK_CLAIMABLE_DEPOSIT}
        onAfterClaimRefetch={mockOnAfterClaimRefetch}
      />,
      { wrapper: TestWrapper },
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('btc-vault-claim-shares-button'))
      await Promise.resolve()
      await vi.advanceTimersByTimeAsync(BTC_VAULT_BACKEND_INDEX_DELAY_MS)
    })

    expect(mockInvalidateAfterAction).toHaveBeenCalledWith('dep-1')
    expect(mockOnAfterClaimRefetch).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
