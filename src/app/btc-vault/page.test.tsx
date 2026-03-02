import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@/shared/context/FeatureFlag', () => ({
  withServerFeatureFlag: vi.fn((Component, _config) => Component),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: undefined, isConnected: false }),
}))

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: () => ({ data: undefined }),
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

describe('BtcVault page', () => {
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
  })

  it('renders BtcVaultPage when feature flag is enabled', async () => {
    const Page = (await import('./page')).default
    const { container } = render(<Page />)
    expect(container.querySelector('[data-testid="BTC Vault"]')).toBeInTheDocument()
  })
})
