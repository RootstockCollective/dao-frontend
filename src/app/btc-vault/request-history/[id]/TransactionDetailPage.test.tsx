import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TransactionDetailPage } from './TransactionDetailPage'

const mockUseAccount = vi.fn()
const mockUseRequestById = vi.fn()
const mockShowToast = vi.fn()
const mockOnCancelRequest = vi.fn()
const mockClaim = vi.fn()
const mockUseClaimRequest = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../../hooks/useRequestById', () => ({
  useRequestById: (id: string | undefined) => mockUseRequestById(id),
}))

vi.mock('../../hooks/useCancelRequest', () => ({
  useCancelBtcVaultRequest: () => ({
    onCancelRequest: mockOnCancelRequest,
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    cancelTxHash: undefined,
  }),
}))

vi.mock('../../hooks/useClaimRequest', () => ({
  useClaimRequest: (...args: unknown[]) => mockUseClaimRequest(...args),
}))

vi.mock('@/shared/notification', () => ({
  showToast: (args: unknown) => mockShowToast(args),
}))

vi.mock('@/shared/walletConnection/connection/useAppKitFlow', () => ({
  useAppKitFlow: vi.fn(() => ({
    onConnectWalletButtonClick: vi.fn(),
    handleConnectWallet: vi.fn(),
    handleCloseIntermediateStep: vi.fn(),
  })),
}))

vi.mock('@/components/TokenImage', () => ({
  TokenImage: () => <span data-testid="token-image" />,
}))

vi.mock('@/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

vi.mock('@/components/ProgressBarNew', () => ({
  ProgressBar: ({ progress }: { progress: number }) => (
    <div data-testid="progress-bar" data-progress={progress} />
  ),
  ProgressStepper: () => <div data-testid="progress-stepper" />,
}))

vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

const ONE_BTC = 10n ** 18n

const MOCK_WITHDRAWAL_PENDING = {
  id: 'req-withdrawal-pending',
  type: 'withdrawal' as const,
  amount: ONE_BTC / 2n,
  status: 'pending' as const,
  epochId: null,
  batchRedeemId: '1',
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'a'.repeat(64) },
}

const MOCK_DEPOSIT_DONE = {
  id: 'req-deposit-done',
  type: 'deposit' as const,
  amount: 2n * ONE_BTC,
  status: 'done' as const,
  epochId: '0',
  batchRedeemId: null,
  timestamps: { created: 1700000000, finalized: 1700003600 },
  txHashes: { submit: '0x' + 'b'.repeat(64), finalize: '0x' + 'c'.repeat(64) },
}

const MOCK_WITHDRAWAL_APPROVED = {
  id: 'req-withdrawal-approved',
  type: 'withdrawal' as const,
  amount: ONE_BTC / 2n,
  status: 'pending' as const,
  displayStatus: 'approved' as const,
  epochId: null,
  batchRedeemId: '1',
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'a'.repeat(64) },
}

const MOCK_WITHDRAWAL_CLAIMABLE = {
  id: 'req-withdrawal-claimable',
  type: 'withdrawal' as const,
  amount: ONE_BTC / 2n,
  status: 'claimable' as const,
  displayStatus: 'claim_pending' as const,
  epochId: null,
  batchRedeemId: '2',
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'd'.repeat(64) },
}

const MOCK_DEPOSIT_CLAIMABLE = {
  id: 'req-deposit-claimable',
  type: 'deposit' as const,
  amount: ONE_BTC,
  status: 'claimable' as const,
  displayStatus: 'open_to_claim' as const,
  epochId: '1',
  batchRedeemId: null,
  timestamps: { created: 1700000000 },
  txHashes: { submit: '0x' + 'e'.repeat(64) },
}

describe('TransactionDetailPage', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb29266',
      isConnected: true,
    })
    mockUseRequestById.mockReturnValue({ data: MOCK_WITHDRAWAL_PENDING, isLoading: false })
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: false,
      claimableAmount: 0n,
      isReadingAmount: false,
      isRequesting: false,
      isTxPending: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders "WITHDRAWAL REQUEST" title for a withdrawal', () => {
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    expect(screen.getByText('WITHDRAWAL REQUEST')).toBeInTheDocument()
  })

  it('renders "DEPOSIT REQUEST" title for a deposit', () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_DEPOSIT_DONE, isLoading: false })
    render(<TransactionDetailPage id="req-deposit-done" />)
    expect(screen.getByText('DEPOSIT REQUEST')).toBeInTheDocument()
  })

  it('renders stepper, detail grid, and cancel button for pending request', () => {
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    expect(screen.getByTestId('request-status-stepper')).toBeInTheDocument()
    expect(screen.getByTestId('request-detail-grid')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-request-button')).toBeInTheDocument()
  })

  it('does not render cancel button for non-pending request', () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_DEPOSIT_DONE, isLoading: false })
    render(<TransactionDetailPage id="req-deposit-done" />)
    expect(screen.getByTestId('request-detail-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('cancel-request-button')).not.toBeInTheDocument()
  })

  it('renders not-connected oops when wallet is disconnected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    expect(screen.getByTestId('transaction-detail-oops-not-connected')).toBeInTheDocument()
    expect(screen.getByText('Connect your wallet to view request details')).toBeInTheDocument()
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
  })

  it('renders not-found oops when request ID does not match', () => {
    mockUseRequestById.mockReturnValue({ data: null, isLoading: false })
    render(<TransactionDetailPage id="unknown-id" />)
    expect(screen.getByTestId('transaction-detail-oops-not-found')).toBeInTheDocument()
    expect(screen.getByText('Request not found')).toBeInTheDocument()
    expect(screen.getByTestId('back-to-history-link')).toBeInTheDocument()
  })

  it('renders loading state while data is being fetched', () => {
    mockUseRequestById.mockReturnValue({ data: undefined, isLoading: true })
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('transaction-detail-page')).not.toBeInTheDocument()
  })

  it('opens cancel confirmation modal when cancel button is clicked', () => {
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    expect(screen.queryByTestId('CancelRequestModal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('cancel-request-button'))
    expect(screen.getByTestId('CancelRequestModal')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to cancel this request?')).toBeInTheDocument()
  })

  it('does not render cancel button for approved withdrawal', () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_WITHDRAWAL_APPROVED, isLoading: false })
    render(<TransactionDetailPage id="req-withdrawal-approved" />)
    expect(screen.getByTestId('request-detail-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('cancel-request-button')).not.toBeInTheDocument()
  })

  it('renders claim button with "Claim rBTC" for claimable withdrawal', () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_WITHDRAWAL_CLAIMABLE, isLoading: false })
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      claimableAmount: ONE_BTC / 2n,
      isReadingAmount: false,
      isRequesting: false,
      isTxPending: false,
    })
    render(<TransactionDetailPage id="req-withdrawal-claimable" />)
    expect(screen.getByTestId('claim-button')).toBeInTheDocument()
    expect(screen.getByTestId('claim-button')).toHaveTextContent('Claim rBTC')
    expect(screen.queryByTestId('cancel-request-button')).not.toBeInTheDocument()
  })

  it('renders claim button with "Claim Shares" for claimable deposit', () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_DEPOSIT_CLAIMABLE, isLoading: false })
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      claimableAmount: ONE_BTC,
      isReadingAmount: false,
      isRequesting: false,
      isTxPending: false,
    })
    render(<TransactionDetailPage id="req-deposit-claimable" />)
    expect(screen.getByTestId('claim-button')).toBeInTheDocument()
    expect(screen.getByTestId('claim-button')).toHaveTextContent('Claim Shares')
    expect(screen.queryByTestId('cancel-request-button')).not.toBeInTheDocument()
  })

  it('shows success toast when claim succeeds', async () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_WITHDRAWAL_CLAIMABLE, isLoading: false })
    mockClaim.mockResolvedValue('0xclaimhash')
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      claimableAmount: ONE_BTC / 2n,
      isReadingAmount: false,
      isRequesting: false,
      isTxPending: false,
    })
    render(<TransactionDetailPage id="req-withdrawal-claimable" />)
    fireEvent.click(screen.getByTestId('claim-button'))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        severity: 'success',
        title: 'rBTC claimed',
        content: 'Your claim transaction has been submitted.',
      })
    })
  })

  it('shows error toast when claim fails', async () => {
    mockUseRequestById.mockReturnValue({ data: MOCK_DEPOSIT_CLAIMABLE, isLoading: false })
    mockClaim.mockRejectedValue(new Error('User rejected'))
    mockUseClaimRequest.mockReturnValue({
      claim: mockClaim,
      canClaim: true,
      claimableAmount: ONE_BTC,
      isReadingAmount: false,
      isRequesting: false,
      isTxPending: false,
    })
    render(<TransactionDetailPage id="req-deposit-claimable" />)
    fireEvent.click(screen.getByTestId('claim-button'))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        severity: 'error',
        title: 'Claim failed',
        content: 'User rejected',
      })
    })
  })

  it('shows success toast and closes modal when "Yes, cancel" is clicked', async () => {
    mockOnCancelRequest.mockResolvedValue('0xmockhash')
    render(<TransactionDetailPage id="req-withdrawal-pending" />)
    fireEvent.click(screen.getByTestId('cancel-request-button'))
    fireEvent.click(screen.getByTestId('CancelRequestConfirm'))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        severity: 'success',
        title: 'Request canceled',
        content: 'Your request has been canceled successfully.',
      })
    })
    expect(screen.queryByTestId('CancelRequestModal')).not.toBeInTheDocument()
  })
})
