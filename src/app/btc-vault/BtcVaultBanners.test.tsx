import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { BtcVaultBanners } from './BtcVaultBanners'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  }
})

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

describe('BtcVaultBanners', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseActionEligibility.mockReturnValue({ data: undefined })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders disclosure banner when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('DisclosureBanner')).toBeInTheDocument()
    expect(screen.getByText('DISCLOSURE')).toBeInTheDocument()
    expect(screen.getByTestId('DisclosureContent')).toBeInTheDocument()
  })

  it('does not render disclosure banner when wallet is connected and eligible', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('renders NotAuthorizedBanner when connected but not eligible', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByText('KYC required')).toBeInTheDocument()
    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
  })
})
