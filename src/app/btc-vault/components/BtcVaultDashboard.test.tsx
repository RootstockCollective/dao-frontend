import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import type { VaultRequest } from '../services/types'
import type { UserPositionDisplay } from '../services/ui/types'
import { BtcVaultDashboard } from './BtcVaultDashboard'

const FIVE_SHARES_RAW = 5n * WeiPerEther * VAULT_SHARE_MULTIPLIER

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

const mockUseAccount = vi.fn()
const mockUseUserPosition = vi.fn()
const mockUseActionEligibility = vi.fn()
const mockUseBtcVaultWithdrawFlow = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useUserPosition/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
}))

vi.mock('../hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

vi.mock('../hooks/useBtcVaultWithdrawFlow', () => ({
  useBtcVaultWithdrawFlow: (opts: { onRequestSubmitted?: () => void }) =>
    mockUseBtcVaultWithdrawFlow(opts),
}))

vi.mock('./BtcVaultActions', () => ({
  BtcVaultActions: () => <div data-testid="btc-vault-actions" />,
}))

vi.mock('./BtcVaultClaimSharesButton', () => ({
  BtcVaultClaimSharesButton: ({
    vaultRequest,
    onAfterClaimRefetch,
  }: {
    vaultRequest: VaultRequest | null
    onAfterClaimRefetch?: () => void
  }) => (
    <button
      type="button"
      data-testid="btc-vault-claim-shares-probe"
      data-request-id={vaultRequest?.id ?? ''}
      data-has-refetch={onAfterClaimRefetch ? 'yes' : 'no'}
      onClick={() => onAfterClaimRefetch?.()}
    />
  ),
}))

vi.mock('./BtcVaultRedeemSharesButton', () => ({
  BtcVaultRedeemSharesButton: ({
    vaultRequest,
    onAfterRedeemRefetch,
  }: {
    vaultRequest: VaultRequest | null
    onAfterRedeemRefetch?: () => void
  }) => (
    <button
      type="button"
      data-testid="btc-vault-redeem-shares-probe"
      data-request-id={vaultRequest?.id ?? ''}
      data-has-refetch={onAfterRedeemRefetch ? 'yes' : 'no'}
      onClick={() => onAfterRedeemRefetch?.()}
    />
  ),
}))

const MOCK_DISPLAY: UserPositionDisplay = {
  rbtcBalanceFormatted: '2',
  vaultTokensFormatted: '5.00',
  positionValueFormatted: '5.1',
  percentOfVaultFormatted: '10.20%',
  vaultTokensRaw: FIVE_SHARES_RAW,
  rbtcBalanceRaw: 2_000_000_000_000_000_000n,
  totalDepositedPrincipalFormatted: '5',
  totalDepositedPrincipalRaw: 5_000_000_000_000_000_000n,
  currentEarningsFormatted: '0.1',
  totalBalanceFormatted: '5.1',
  totalBalanceRaw: 5_100_000_000_000_000_000n,
  yieldPercentToDateFormatted: '2.00%',
  fiatWalletBalance: '$47,500.00 USD',
  fiatVaultShares: '$121,125.00 USD',
  fiatPrincipalDeposited: '$118,750.00 USD',
  fiatCurrentEarnings: '$2,375.00 USD',
  fiatTotalBalance: '$121,125.00 USD',
}

describe('BtcVaultDashboard', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({ data: MOCK_DISPLAY, isLoading: false })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        hasVaultShares: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
      isLoading: false,
      refetch: vi.fn(),
    })
    mockUseBtcVaultWithdrawFlow.mockReturnValue({
      isWithdrawModalOpen: false,
      openWithdrawModal: vi.fn(),
      closeWithdrawModal: vi.fn(),
      handleApproveWithdrawShares: vi.fn(),
      handleRequestWithdrawRedeem: vi.fn(),
      allowance: undefined,
      isAllowanceReadLoading: false,
      hasAllowanceFor: vi.fn().mockResolvedValue(false),
      isApprovingShares: false,
      isWithdrawSubmitting: false,
      isAllowanceTxFailed: false,
      allowanceTxHash: undefined,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders MY METRICS title when connected', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    expect(screen.getByText('MY METRICS')).toBeInTheDocument()
  })

  it('applies background to the entire dashboard section via SectionContainer', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    const dashboard = screen.getByTestId('btc-vault-dashboard')
    const sectionContainer = dashboard.closest('.bg-bg-80')
    expect(sectionContainer).toBeInTheDocument()
  })

  it('renders 7 BalanceInfo metrics when connected with data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toBeInTheDocument()
    expect(screen.getByTestId('metric-vault-shares')).toBeInTheDocument()
    expect(screen.getByTestId('metric-share-of-vault')).toBeInTheDocument()
    expect(screen.getByTestId('metric-principal')).toBeInTheDocument()
    expect(screen.getByTestId('metric-earnings')).toBeInTheDocument()
    expect(screen.getByTestId('metric-total-balance')).toBeInTheDocument()
    expect(screen.getByTestId('metric-yield-percent')).toBeInTheDocument()
  })

  it('displays formatted amounts from useUserPosition data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toHaveTextContent('2')
    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('5.00')
    expect(screen.getByTestId('metric-share-of-vault')).toHaveTextContent('10.20%')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('5')
    expect(screen.getByTestId('metric-earnings')).toHaveTextContent('0.1')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('5.1')
    expect(screen.getByTestId('metric-yield-percent')).toHaveTextContent('2.00%')
  })

  it('displays fiat amounts for applicable metrics', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toHaveTextContent('$47,500.00 USD')
    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('$121,125.00 USD')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('$118,750.00 USD')
    expect(screen.getByTestId('metric-earnings')).toHaveTextContent('$2,375.00 USD')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('$121,125.00 USD')
  })

  it('shows pulsing zero placeholders when isLoading', () => {
    mockUseUserPosition.mockReturnValue({ data: undefined, isLoading: true })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const placeholders = screen.getAllByText('0')
    expect(placeholders.length).toBe(7)
    placeholders.forEach(el => {
      expect(el).toHaveClass('animate-pulse')
    })
  })

  it('shows zeros for empty position — no dashes', () => {
    const emptyDisplay: UserPositionDisplay = {
      rbtcBalanceFormatted: '0',
      vaultTokensFormatted: '0',
      positionValueFormatted: '0',
      percentOfVaultFormatted: '0.00%',
      vaultTokensRaw: 0n,
      rbtcBalanceRaw: 0n,
      totalDepositedPrincipalFormatted: '0',
      totalDepositedPrincipalRaw: 0n,
      currentEarningsFormatted: '0',
      totalBalanceFormatted: '0',
      totalBalanceRaw: 0n,
      yieldPercentToDateFormatted: '0.00%',
      fiatWalletBalance: '$0.00 USD',
      fiatVaultShares: '$0.00 USD',
      fiatPrincipalDeposited: '$0.00 USD',
      fiatCurrentEarnings: '$0.00 USD',
      fiatTotalBalance: '$0.00 USD',
    }
    mockUseUserPosition.mockReturnValue({ data: emptyDisplay, isLoading: false })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-share-of-vault')).toHaveTextContent('0.00%')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-earnings')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-yield-percent')).toHaveTextContent('0.00%')

    const dashboard = screen.getByTestId('btc-vault-dashboard')
    expect(dashboard.textContent).not.toContain('—')
    expect(dashboard.textContent).not.toContain('- ')
  })

  it('renders tooltip icons on all metrics that have tooltips', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const metricsWithTooltips = [
      'metric-wallet',
      'metric-vault-shares',
      'metric-share-of-vault',
      'metric-earnings',
      'metric-total-balance',
      'metric-yield-percent',
    ]

    metricsWithTooltips.forEach(testId => {
      const metric = screen.getByTestId(testId)
      expect(metric.querySelector('[data-testid="TooltipIcon"]')).toBeInTheDocument()
    })
  })

  it('shows View history under Principal when user has position history', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const historyLink = screen.getByTestId('btc-vault-history-link')
    expect(historyLink).toBeInTheDocument()
    expect(screen.getByText('View history')).toBeInTheDocument()
    expect(historyLink.querySelector('[aria-label="History Icon"]')).toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-yield-history-link')).not.toBeInTheDocument()
  })

  it('positions View history under Principal deposited', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const principalMetric = screen.getByTestId('metric-principal')
    const historyLink = screen.getByTestId('btc-vault-history-link')
    expect(principalMetric.parentElement).toContain(historyLink)
  })

  it('shows View history under Principal even when vault share balance is zero', () => {
    const emptyDisplay: UserPositionDisplay = {
      ...MOCK_DISPLAY,
      vaultTokensRaw: 0n,
    }
    mockUseUserPosition.mockReturnValue({ data: emptyDisplay, isLoading: false })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const historyLink = screen.getByTestId('btc-vault-history-link')
    expect(historyLink).toBeInTheDocument()
    expect(historyLink).toHaveAttribute('href', '/btc-vault/request-history')
  })

  it('returns null when wallet is disconnected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    const { container } = render(<BtcVaultDashboard />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when address is undefined but isConnected is true', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: true })
    const { container } = render(<BtcVaultDashboard />)
    expect(container.innerHTML).toBe('')
  })

  it('shows dashes for all metrics when useUserPosition returns an error', () => {
    mockUseUserPosition.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBe(7)
  })

  it('forwards claimableDepositRequest and onAfterClaimRefetch to Claim Shares', () => {
    const onRefetch = vi.fn()
    const claimableReq: VaultRequest = {
      id: 'dep-dash-probe',
      type: 'deposit',
      status: 'claimable',
      amount: 1n,
      epochId: '1',
      batchRedeemId: null,
      timestamps: { created: 0 },
      txHashes: {},
    }
    render(
      <BtcVaultDashboard claimableDepositRequest={claimableReq} onAfterClaimRefetch={onRefetch} />,
      { wrapper: Wrapper },
    )
    const probe = screen.getByTestId('btc-vault-claim-shares-probe')
    expect(probe).toHaveAttribute('data-request-id', 'dep-dash-probe')
    expect(probe).toHaveAttribute('data-has-refetch', 'yes')
  })

  it('passes null claimableDepositRequest to Claim Shares when omitted', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    const probe = screen.getByTestId('btc-vault-claim-shares-probe')
    expect(probe).toHaveAttribute('data-request-id', '')
    expect(probe).toHaveAttribute('data-has-refetch', 'yes')
  })

  it('forwards claimableWithdrawRequest and onAfterRedeemRefetch to Redeem Shares', () => {
    const onRefetch = vi.fn()
    const claimableWithdraw: VaultRequest = {
      id: 'red-dash-probe',
      type: 'withdrawal',
      status: 'claimable',
      amount: 1n,
      epochId: null,
      batchRedeemId: '9',
      timestamps: { created: 0 },
      txHashes: {},
    }
    render(
      <BtcVaultDashboard claimableWithdrawRequest={claimableWithdraw} onAfterRedeemRefetch={onRefetch} />,
      { wrapper: Wrapper },
    )
    const probe = screen.getByTestId('btc-vault-redeem-shares-probe')
    expect(probe).toHaveAttribute('data-request-id', 'red-dash-probe')
    expect(probe).toHaveAttribute('data-has-refetch', 'yes')
  })

  it('passes null claimableWithdrawRequest to Redeem Shares when omitted', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    const probe = screen.getByTestId('btc-vault-redeem-shares-probe')
    expect(probe).toHaveAttribute('data-request-id', '')
    expect(probe).toHaveAttribute('data-has-refetch', 'yes')
  })

  it('refetches action eligibility after parent onAfterClaimRefetch when claim probe fires', async () => {
    const user = userEvent.setup()
    const refetchEligibility = vi.fn()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        hasVaultShares: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
      isLoading: false,
      refetch: refetchEligibility,
    })
    const onRefetch = vi.fn()
    render(<BtcVaultDashboard onAfterClaimRefetch={onRefetch} />, { wrapper: Wrapper })
    await user.click(screen.getByTestId('btc-vault-claim-shares-probe'))
    expect(onRefetch).toHaveBeenCalledTimes(1)
    expect(refetchEligibility).toHaveBeenCalledTimes(1)
    expect(onRefetch.mock.invocationCallOrder[0]).toBeLessThan(refetchEligibility.mock.invocationCallOrder[0])
  })

  it('refetches action eligibility when claim probe fires without parent callback', async () => {
    const user = userEvent.setup()
    const refetchEligibility = vi.fn()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        hasVaultShares: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
      isLoading: false,
      refetch: refetchEligibility,
    })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    await user.click(screen.getByTestId('btc-vault-claim-shares-probe'))
    expect(refetchEligibility).toHaveBeenCalledTimes(1)
  })

  it('refetches action eligibility after parent onAfterRedeemRefetch when redeem probe fires', async () => {
    const user = userEvent.setup()
    const refetchEligibility = vi.fn()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        hasVaultShares: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
      isLoading: false,
      refetch: refetchEligibility,
    })
    const onRefetch = vi.fn()
    render(<BtcVaultDashboard onAfterRedeemRefetch={onRefetch} />, { wrapper: Wrapper })
    await user.click(screen.getByTestId('btc-vault-redeem-shares-probe'))
    expect(onRefetch).toHaveBeenCalledTimes(1)
    expect(refetchEligibility).toHaveBeenCalledTimes(1)
    expect(onRefetch.mock.invocationCallOrder[0]).toBeLessThan(refetchEligibility.mock.invocationCallOrder[0])
  })
})
