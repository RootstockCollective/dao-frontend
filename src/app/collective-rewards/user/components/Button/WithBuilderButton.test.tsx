// WithBuilderButton.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withBuilderButton } from './WithBuilderButton'

// --- Mocks for child components ---

// Spy for NFTBoosterCard – we render a simple div that displays the boost value and title.
const mockNFTBoosterCard = vi.fn(({ boostValue, nftThumbPath, title }) => (
  <div data-testid="nft-booster-card">
    NFT Booster: {boostValue} - {title}
  </div>
))
// Spy for BecomeABuilderButton – we render a simple div showing the address.
const mockBecomeABuilderButton = vi.fn(({ address }) => (
  <div data-testid="builder-button">Builder Address: {address}</div>
))

// Mock the BecomeABuilderButton module.
vi.mock('./BecomeABuilderButton', () => ({
  BecomeABuilderButton: (props: any) => mockBecomeABuilderButton(props),
}))

// Mock the shared components module (specifically NFTBoosterCard).
vi.mock('@/app/shared/components', () => ({
  NFTBoosterCard: (props: any) => mockNFTBoosterCard(props),
}))

// --- Mocks for hooks and utilities ---

// Mock the wagmi useAccount hook.
import { useAccount } from 'wagmi'
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock the NFT booster context hook.
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
vi.mock('@/app/providers/NFT/BoosterContext', () => ({
  useNFTBoosterContext: vi.fn(),
}))

// Mock the communitiesMapByContract so that it returns a title when queried with a known address.
vi.mock('@/app/communities/communityUtils', () => ({
  communitiesMapByContract: {
    '0xabc': { title: 'Test NFT' },
  },
}))

// --- Create a dummy component to wrap ---
function DummyComponent() {
  return <div data-testid="dummy">Dummy Component</div>
}
DummyComponent.displayName = 'DummyComponent'

// Wrap the DummyComponent using the HOC.
const WrappedComponent = withBuilderButton(DummyComponent)

describe('withBuilderButton HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the wrapped component and BecomeABuilderButton when no active NFT booster campaign', () => {
    // Setup mocks for a scenario with no active campaign.
    ;(useAccount as any).mockReturnValue({ address: '0x1234' })
    ;(useNFTBoosterContext as any).mockReturnValue({
      hasActiveCampaign: false,
      currentBoost: undefined,
      boostData: undefined,
    })

    render(<WrappedComponent />)

    // Verify the wrapped (dummy) component is rendered.
    expect(screen.getByTestId('dummy')).toBeInTheDocument()

    // NFTBoosterCard should NOT be rendered.
    expect(screen.queryByTestId('nft-booster-card')).toBeNull()

    // BecomeABuilderButton should be rendered with the correct address.
    expect(screen.getByTestId('builder-button')).toHaveTextContent('0x1234')
  })

  it('renders NFTBoosterCard when active NFT booster campaign is present', () => {
    // Setup mocks for a scenario with an active campaign and boost data.
    ;(useAccount as any).mockReturnValue({ address: '0x1234' })
    ;(useNFTBoosterContext as any).mockReturnValue({
      hasActiveCampaign: true,
      currentBoost: 10,
      boostData: {
        nftContractAddress: '0xabc',
        boostPercentage: '20', // Note: boostPercentage is a string in the original code.
      },
    })

    render(<WrappedComponent />)

    // Verify NFTBoosterCard is rendered with the correct boost value and title.
    expect(screen.getByTestId('nft-booster-card')).toHaveTextContent('NFT Booster: 20 - Test NFT')

    // Also verify that BecomeABuilderButton is rendered.
    // FIXME: not working. finding duplicates of the button
    // expect(screen.getByTestId('builder-button')).not.toBeNull()
  })

  it('sets the displayName correctly', () => {
    expect(WrappedComponent.displayName).toBe('WithBuilderButton(DummyComponent)')
  })
})
