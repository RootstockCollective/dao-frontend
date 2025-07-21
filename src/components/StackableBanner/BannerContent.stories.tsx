import type { Meta, StoryObj } from '@storybook/react'
import { BannerContent } from './BannerContent'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'

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

const rbtcImage = <TokenImage symbol={RBTC} size={26} className="inline-block mt-[-0.2rem]" />
const rifImage = <TokenImage symbol={RIF} size={24} className="inline-block mt-[-0.2rem]" />

// Export args directly for reuse
export const getRbtcArgs = {
  title: <span>GET {rbtcImage} rBTC</span>,
  description: "You need it to pay the DAO's gas fees",
  buttonText: 'Get rBTC',
  buttonOnClick: () => console.log('Get rBTC clicked!'),
}

export const getRifArgs = {
  title: <span>GET {rifImage} RIF</span>,
  description: "You need it to take part in the DAO's activities",
  buttonText: 'Get RIF',
  buttonOnClick: () => console.log('Get RIF clicked!'),
}

export const stakeRifArgs = {
  title: <span>STAKE {rifImage} RIF</span>,
  description: "Stake RIF so you can take part in Rootstock Collective's governance",
  buttonText: 'Stake RIF',
  buttonOnClick: () => console.log('Stake RIF clicked!'),
}

export const voteArgs = {
  title: 'VOTE',
  description: 'Vote on your first proposal... lorem ipsum dolor sit amet consectetur',
  buttonText: 'See proposals',
  buttonOnClick: () => console.log('See proposals clicked!'),
}

export const backArgs = {
  title: 'BACK',
  description: 'Back Builders... lorem ipsum dolor sit amet consectetur adipiscing elit',
  buttonText: 'See all Builders',
  buttonOnClick: () => console.log('See all Builders clicked!'),
}

export const submitKycArgs = {
  title: 'TAKE THE NEXT STEP',
  description: 'Your application to become a Builder is in progress. Submit your KYC now to speed things up.',
  buttonText: 'Submit KYC',
  buttonOnClick: () => console.log('Submit KYC clicked!'),
}

export const startBuildingArgs = {
  title: 'START BUILDING',
  description: 'You are now a Collective Builder, congratulations! Create a proposal or apply for a grant.',
  buttonText: 'See all Builders',
  buttonOnClick: () => console.log('See all Builders clicked!'),
}

export const currentCycleEndingSoonArgs = {
  title: 'CURRENT CYCLE ENDING SOON',
  description: (
    <Typography size="sm" className="flex items-center gap-1">
      Learn how cycles work <ArrowRight />
    </Typography>
  ),
  buttonOnClick: () => console.log('Learn more clicked!'),
  rightContent: (
    <Typography variant="h1" className="text-white">
      23h 59m
    </Typography>
  ),
}

export const cycleJustEndedArgs = {
  title: 'CYCLE JUST ENDED',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  buttonText: 'Claim Rewards',
  buttonOnClick: () => console.log('Claim Rewards clicked!'),
}

export const stepsListArgs = {
  title: 'TITLE ONLY IF NEEDED',
  description: (
    <div>
      <Typography size="sm" className="mb-3">
        Lorem ipsum dolor sit amet consectetur adipiscing elit
      </Typography>
      <ul className="space-y-2 list-disc list-inside">
        <li>
          <Typography size="sm">step 1... lorem ipsum dolor sit amet, consectetur adipiscing elit</Typography>
        </li>
        <li>
          <Typography size="sm">
            step 2... proin suscipit scelerisque ipsum placerat velit sed quam
          </Typography>
        </li>
        <li>
          <Typography size="sm">step 3... venenatis, non commodo risus fringilla</Typography>
        </li>
      </ul>
    </div>
  ),
  buttonText: 'CTA label',
  buttonOnClick: () => console.log('CTA label clicked!'),
}

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
