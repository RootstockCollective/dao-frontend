import type { Meta, StoryObj } from '@storybook/nextjs'
import { NFTBoosterCard } from './NFTBoosterCard'

const meta = {
  title: 'Components/NFTBoosterCard',
  component: NFTBoosterCard,
} satisfies Meta<typeof NFTBoosterCard>

export default meta

type Story = StoryObj<typeof meta>

export const NFTBoosterCardDefault: Story = {
  args: {
    boostValue: 20,
    nftThumbPath: 'images/nfts/vanguard-thumb.jpg',
    title: 'Vanguard',
    content: 'Boost your NFTs with the Vanguard booster.',
  },
}
