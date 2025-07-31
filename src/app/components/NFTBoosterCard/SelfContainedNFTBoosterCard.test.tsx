import { BoostData, useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { SelfContainedNFTBoosterCard } from './SelfContainedNFTBoosterCard'

vi.mock('@/app/providers/NFT/BoosterContext', () => ({
  useNFTBoosterContext: vi.fn(),
}))

vi.mock('@/lib/ipfs', () => ({
  applyPinataImageOptions: vi.fn(),
}))

vi.mock('@/app/communities/communityUtils', () => ({
  communitiesMapByContract: {
    '0xabc': { title: 'Test NFT', leftImageSrc: '/' },
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

  test('should not render if there is an active campaign and account is not boosted', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: true,
      isBoosted: false,
      isCampaignActive: () => false,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })

  test('should render not boosted message if there is an active campaign, account is not boosted and forceRender is true', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: true,
      isBoosted: false,
      isCampaignActive: () => true,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard forceRender={true} />)

    expect(await findByText(notBoostedMessage)).toBeVisible()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })

  test('should render boosted message if there is active campaign and account is boosted', async () => {
    const isBoosted = true
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      userHasRewards: true,
      isBoosted: isBoosted,
      isCampaignActive: () => true,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard forceRender={isBoosted} />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    expect(await findByText(boostedMessage)).toBeVisible()
  })

  test('should not render if there is no active campaign', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData,
      hasActiveCampaign: false,
      isBoosted: false,
      isCampaignActive: () => true,
    })
    const { findByText } = render(<SelfContainedNFTBoosterCard />)

    await expect(() => findByText(notBoostedMessage)).rejects.toThrow()
    await expect(() => findByText(boostedMessage)).rejects.toThrow()
  })
})
