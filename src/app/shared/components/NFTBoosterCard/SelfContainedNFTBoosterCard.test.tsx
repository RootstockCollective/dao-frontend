import { describe, expect, test, vi, afterEach } from 'vitest'
import { SelfContainedNFTBoosterCard } from './SelfContainedNFTBoosterCard'
import { cleanup, render } from '@testing-library/react'
import { BoostData, useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'

vi.mock('@/app/providers/NFT/BoosterContext', () => ({
  useNFTBoosterContext: vi.fn(),
}))

vi.mock('@/app/communities/communityUtils', () => ({
  communitiesMapByContract: {
    '0xabc': { title: 'Test NFT' },
  },
}))

describe('SelfContainedNFTBoosterCard', () => {
  const nftAddress = '0xabc'
  const title = 'Test NFT'
  const boostPercentage = 10n
  const notBoostedMessage = `Voting ${title} Booster`
  const boostedMessage = `You're earning ${Number(boostPercentage)}% more rewards thanks to your ${title} NFT.`
  const boostData = {
    nftContractAddress: nftAddress,
    boostPercentage,
  } as unknown as BoostData

  afterEach(() => {
    cleanup()
  })

  test('should render not boosted message if there is an active campaign and account is not boosted', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: true,
      isBoosted: false,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard />)

    expect(await findByText(notBoostedMessage)).toBeVisible()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })

  test('should not render if there is active campaign, account is not boosted and hideNotBoosted is true', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: true,
      isBoosted: false,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard hideNotBoosted={true} />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })

  test('should render boosted message if there is active campaign and account is boosted', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: true,
      isBoosted: true,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    expect(await findByText(boostedMessage)).toBeVisible()
  })

  test('should not render if there is no active campaign', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: false,
      isBoosted: false,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })
})
