import type { Meta, StoryObj } from '@storybook/react'
import { StackableBanner } from './StackableBanner'
import { BannerContent } from './BannerContent'
import {
  getRbtcArgs,
  getRifArgs,
  stakeRifArgs,
  voteArgs,
  backArgs,
  submitKycArgs,
  startBuildingArgs,
  currentCycleEndingSoonArgs,
  cycleJustEndedArgs,
  stepsListArgs,
} from './BannerContent.stories'

const meta: Meta<typeof StackableBanner> = {
  title: 'Components/StackableBanner',
  component: StackableBanner,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ margin: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const WithGetRbtc: Story = {
  args: {
    children: <BannerContent {...getRbtcArgs} />,
  },
}

export const WithGetRif: Story = {
  args: {
    children: <BannerContent {...getRifArgs} />,
  },
}

export const WithStakeRif: Story = {
  args: {
    children: <BannerContent {...stakeRifArgs} />,
  },
}

export const WithVote: Story = {
  args: {
    children: <BannerContent {...voteArgs} />,
  },
}

export const WithBack: Story = {
  args: {
    children: <BannerContent {...backArgs} />,
  },
}

export const WithSubmitKyc: Story = {
  args: {
    children: <BannerContent {...submitKycArgs} />,
  },
}

export const WithStartBuilding: Story = {
  args: {
    children: <BannerContent {...startBuildingArgs} />,
  },
}

export const WithCurrentCycleEndingSoon: Story = {
  args: {
    children: <BannerContent {...currentCycleEndingSoonArgs} />,
  },
}

export const WithCycleJustEnded: Story = {
  args: {
    children: <BannerContent {...cycleJustEndedArgs} />,
  },
}

export const WithStepsList: Story = {
  args: {
    children: <BannerContent {...stepsListArgs} />,
  },
}

export const WithMultipleBanners: Story = {
  args: {
    children: [
      <BannerContent key="back" {...backArgs} />,
      <BannerContent key="cycle" {...currentCycleEndingSoonArgs} />,
    ],
  },
}

export const WithManyBanners: Story = {
  args: {
    children: [
      <BannerContent key="back" {...backArgs} />,
      <BannerContent key="cycle" {...currentCycleEndingSoonArgs} />,
      <BannerContent key="rbtc" {...getRbtcArgs} />,
      <BannerContent key="rif" {...getRifArgs} />,
      <BannerContent key="stake" {...stakeRifArgs} />,
      <BannerContent key="vote" {...voteArgs} />,
      <BannerContent key="building" {...startBuildingArgs} />,
      <BannerContent key="kyc" {...submitKycArgs} />,
      <BannerContent key="ended" {...cycleJustEndedArgs} />,
      <BannerContent key="steps" {...stepsListArgs} />,
    ],
  },
}
