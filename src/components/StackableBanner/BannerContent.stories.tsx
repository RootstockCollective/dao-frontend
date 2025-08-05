import type { Meta, StoryObj } from '@storybook/react'
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
} from './story-utils'

const meta: Meta<typeof BannerContent> = {
  title: 'Components/StackableBanner/BannerContent',
  component: BannerContent,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="bg-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BannerContent>

export const WithGetRbtc: Story = {
  args: getRbtcArgs,
}

export const WithGetRif: Story = {
  args: getRifArgs,
}

export const WithStakeRif: Story = {
  args: stakeRifArgs,
}

export const WithVote: Story = {
  args: voteArgs,
}

export const WithBack: Story = {
  args: backArgs,
}

export const WithSubmitKyc: Story = {
  args: submitKycArgs,
}

export const WithStartBuilding: Story = {
  args: startBuildingArgs,
}

export const WithCurrentCycleEndingSoon: Story = {
  args: currentCycleEndingSoonArgs,
}

export const WithCycleJustEnded: Story = {
  args: cycleJustEndedArgs,
}

export const WithStepsList: Story = {
  args: stepsListArgs,
}
