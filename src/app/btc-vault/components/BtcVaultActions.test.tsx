import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcVaultActions } from './BtcVaultActions'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()
const mockUseUserPosition = vi.fn()
const mockUseVaultMetrics = vi.fn()
const mockOnRequestDeposit = vi.fn()
const mockInvalidateQueries = vi.fn()

let capturedOnSuccess: (() => void) | undefined
let capturedOnError: ((txHash: string | undefined, err: Error) => void) | undefined

const mockExecuteTxFlow = vi.fn().mockImplementation(({ onSuccess, onError }) => {
  capturedOnSuccess = onSuccess
  capturedOnError = onError
  return Promise.resolve('0xmockhash')
})

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}))

vi.mock('../hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

vi.mock('../hooks/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
}))

vi.mock('../hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => mockUseVaultMetrics(),
}))

vi.mock('../hooks/useSubmitDeposit', () => ({
  useSubmitDeposit: () => ({
    onRequestDeposit: mockOnRequestDeposit,
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    depositTxHash: undefined,
  }),
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: (...args: unknown[]) => mockExecuteTxFlow(...args),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

const renderWithProviders = () =>
  render(
    <TooltipProvider>
      <BtcVaultActions />
    </TooltipProvider>,
  )

describe('BtcVaultActions', () => {
  beforeEach(() => {
    capturedOnSuccess = undefined
    capturedOnError = undefined
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({
      data: {
        rbtcBalanceFormatted: '2.0',
        rbtcBalanceRaw: 2000000000000000000n,
        vaultTokensFormatted: '0',
        positionValueFormatted: '0',
        percentOfVaultFormatted: '0%',
        vaultTokensRaw: 0n,
      },
    })
    mockUseVaultMetrics.mockReturnValue({
      data: {
        tvlFormatted: '50',
        apyFormatted: '8.50',
        navFormatted: '1.02',
        timestamp: 1709000000,
        navRaw: 1_020_000_000_000_000_000n,
      },
      isLoading: false,
    })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the Deposit button', () => {
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeInTheDocument()
    expect(screen.getByTestId('DepositButton')).not.toBeDisabled()
  })

  it('disables the Deposit button when canDeposit is false', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('disables the Deposit button when user has active request', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'You already have an active request',
        withdrawBlockReason: 'You already have an active request',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('disables the Deposit button when eligibility data is not yet loaded', () => {
    mockUseActionEligibility.mockReturnValue({ data: undefined })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('opens the modal when clicking the enabled Deposit button', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()
  })

  it('does not open the modal when clicking a disabled Deposit button', async () => {
    const user = userEvent.setup()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Not eligible',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.queryByTestId('BtcDepositModal')).not.toBeInTheDocument()
  })

  it('closes the modal when close button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()

    await user.click(screen.getByTestId('CloseButton'))
    expect(screen.queryByTestId('BtcDepositModal')).not.toBeInTheDocument()
  })

  it('triggers executeTxFlow when user submits deposit from modal', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    // Open modal
    await user.click(screen.getByTestId('DepositButton'))

    // Fill in amount and submit
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    await waitFor(() => {
      expect(mockExecuteTxFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'btcVaultDepositRequest',
          onRequestTx: expect.any(Function),
          onSuccess: expect.any(Function),
        }),
      )
    })
  })

  it('closes modal and shows success banner on successful submission', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    // Open modal and submit
    await user.click(screen.getByTestId('DepositButton'))
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    // Wait for executeTxFlow to be called
    await waitFor(() => {
      expect(capturedOnSuccess).toBeDefined()
    })

    // Simulate success callback
    capturedOnSuccess!()

    await waitFor(() => {
      expect(screen.queryByTestId('BtcDepositModal')).not.toBeInTheDocument()
      expect(screen.getByTestId('DepositSuccessBanner')).toBeInTheDocument()
      expect(screen.getByText('Deposit request submitted')).toBeInTheDocument()
      expect(screen.getByText('Pending Fund Manager approval')).toBeInTheDocument()
      expect(screen.getByTestId('ViewRequestStatusCTA')).toBeInTheDocument()
      expect(screen.getByTestId('GoToPositionCTA')).toBeInTheDocument()
    })
  })

  it('invalidates queries on successful submission', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    // Open modal and submit
    await user.click(screen.getByTestId('DepositButton'))
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    await waitFor(() => {
      expect(capturedOnSuccess).toBeDefined()
    })

    capturedOnSuccess!()

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests', '0x123'],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'action-eligibility', '0x123'],
      })
    })
  })

  it('hides success banner when Deposit button is clicked again', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    // Open modal and submit
    await user.click(screen.getByTestId('DepositButton'))
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    await waitFor(() => {
      expect(capturedOnSuccess).toBeDefined()
    })

    capturedOnSuccess!()

    await waitFor(() => {
      expect(screen.getByTestId('DepositSuccessBanner')).toBeInTheDocument()
    })

    // Opening modal again should hide the success banner
    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.queryByTestId('DepositSuccessBanner')).not.toBeInTheDocument()
  })
})
