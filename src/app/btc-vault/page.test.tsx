import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@/shared/context/FeatureFlag', () => ({
  withServerFeatureFlag: vi.fn((Component, _config) => Component),
}))

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => ({ address: undefined, isConnected: false }),
    useWriteContract: () => ({
      writeContractAsync: vi.fn(),
      data: undefined,
      isPending: false,
    }),
    useWaitForTransactionReceipt: () => ({ isPending: false, failureReason: null }),
  }
})

vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  }
})

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: () => ({ data: undefined }),
}))

vi.mock('./hooks/useActiveRequests', () => ({
  useActiveRequests: () => ({ data: undefined, claimableDepositRequest: null, refetch: vi.fn() }),
}))

vi.mock('./hooks/useEpochState', () => ({
  useEpochState: () => ({
    data: {
      epochId: '1',
      status: 'closed',
      statusSummary: 'Closed',
      isAcceptingRequests: false,
      endTime: 0,
      closesAtFormatted: '01 Jan 1970',
    },
    isLoading: false,
  }),
}))

vi.mock('@/shared/walletConnection/connection/useAppKitFlow', () => ({
  useAppKitFlow: vi.fn(() => ({
    onConnectWalletButtonClick: vi.fn(),
    handleConnectWallet: vi.fn(),
    handleCloseIntermediateStep: vi.fn(),
  })),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

vi.mock('./components/capital-allocation/CapitalAllocationSection', () => ({
  CapitalAllocationSection: () => null,
}))

vi.mock('./components/BtcVaultDashboard', () => ({
  BtcVaultDashboard: () => null,
}))

vi.mock('./components/BtcVaultMetrics', () => ({
  BtcVaultMetrics: () => null,
}))

describe('BtcVault page', () => {
  beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  })

  it('wraps BtcVaultPage with withServerFeatureFlag using btc_vault feature and redirect', async () => {
    const { withServerFeatureFlag } = await import('@/shared/context/FeatureFlag')
    // Import the page module to trigger the withServerFeatureFlag call
    await import('./page')

    expect(withServerFeatureFlag).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        feature: 'btc_vault',
        redirectTo: '/',
      }),
    )
  },10000)

  it('renders BtcVaultPage when feature flag is enabled', async () => {
    const Page = (await import('./page')).default
    const { container } = render(<Page />)
    expect(container.querySelector('[data-testid="BTC Vault"]')).toBeInTheDocument()
  })
})
