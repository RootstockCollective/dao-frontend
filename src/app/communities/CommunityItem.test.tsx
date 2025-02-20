import { describe, expect, test, vi, afterEach } from 'vitest'
import { CommunityItem } from './CommunityItem'
import { cleanup, render } from '@testing-library/react'
import { BoostData, useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'

vi.mock('@/app/providers/NFT/BoosterContext', () => ({
  useNFTBoosterContext: vi.fn(),
}))

describe('CommunityItem', () => {
  const title = 'Early adopters'
  const nftAddress = '0x123'
  const communityItemProps = {
    leftImageSrc: '/src',
    title,
    subtitle: '',
    nftAddress,
    description: '',
    numberOfMembers: 0,
  }

  afterEach(() => {
    cleanup()
  })

  test('should render community item without glowing label if there is no active campaign', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData: {
        nftContractAddress: nftAddress,
      } as unknown as BoostData,
      hasActiveCampaign: false,
      isLoading: false,
      error: null,
    })
    const { findByText, findByTestId } = render(<CommunityItem {...communityItemProps} />)

    expect(await findByText(title)).toBeVisible()
    await expect(() => findByTestId('glowingLabel')).rejects.toThrow()
  })

  test('should render community item with glowing label if there is an active campaign', async () => {
    vi.mocked(useNFTBoosterContext).mockReturnValue({
      boostData: {
        nftContractAddress: nftAddress,
      } as unknown as BoostData,
      hasActiveCampaign: true,
      isLoading: false,
      error: null,
    })
    const { findByText, findByTestId } = render(<CommunityItem {...communityItemProps} />)

    expect(await findByText(title)).toBeVisible()
    expect(await findByTestId('glowingLabel')).toBeVisible()
  })
})
