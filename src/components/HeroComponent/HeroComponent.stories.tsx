import type { Meta, StoryObj } from '@storybook/nextjs'
import { HeroComponent } from './HeroComponent'
import { Button } from '../Button'
import { Header, Paragraph } from '../Typography'
import { CommunityItemButtonHandler } from '@/app/communities/components/CommunityItemButtonHandler'
import { ArrowUpRightLightIcon } from '../Icons'
import { ExternalLink } from '../Link'

const meta: Meta<typeof HeroComponent> = {
  title: 'Components/HeroComponent',
  component: HeroComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HeroComponent>

export const Delegation: Story = {
  args: {
    imageSrc: '/images/hero/delegation-banner.png',
    title: 'Delegate your voting power',
    subtitle: 'to influence what gets built',
    items: [
      'You are only delegating your own voting power',
      'Your tokens stay in your wallet',
      'You save on gas cost while being represented',
      'Your Rewards will keep accumulating as usual',
    ],
    className: 'w-full md:w-[1144px]',
  },
}

/* eslint-disable quotes */
export const Proposal: Story = {
  args: {
    imageSrc: '/images/hero/proposals-banner.png',
    title: 'Propose a Project,',
    subtitle: 'Get support to build it',
    items: [
      <Paragraph key="proposals-page-item-1">
        Clarify your project&apos;s purpose on{' '}
        <ExternalLink>
          Discourse
          <ArrowUpRightLightIcon />
        </ExternalLink>
      </Paragraph>,
      'Submit a proposal to suggest a change or fund a project',
      'The community will view and discuss it',
      'The community will use their stRIF or delegated power to vote',
      'If your proposal passes quorum, it will be approved',
      'Complete your KYC to ensure eligibility (apply for Grants)',
    ],
    button: <Button>Create a proposal</Button>,
    className: 'w-full md:w-[1144px]',
  },
}

export const TopHeroNotConnected: Story = {
  args: {
    imageSrc: '/images/hero/home-hero-top.png',
    title: 'THE COLLECTIVE',
    subtitle: 'POSSIBILITIES',
    topText: "DON'T MISS",
    content: (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Header variant="h2" className="text-black">
            BUILD
          </Header>
          <Paragraph variant="body" className="text-black">
            Become a builder on the Rootstock blockchain by leveraging its EVM compatibility and familiar
            development tools.
          </Paragraph>
        </div>
        <div className="flex flex-col">
          <Header variant="h2" className="text-black">
            EARN
          </Header>
          <Paragraph variant="body" className="text-black">
            Stake RIF and get voting rights and participation in the DAO&apos;s governance and decision-making
            process.
          </Paragraph>
        </div>
        <div className="flex flex-col">
          <Header variant="h2" className="text-black">
            PARTICIPATE
          </Header>
          <Paragraph variant="body" className="text-black">
            Community proposals are discussed and voted on, determining actions such as grants or governance
            changes.
          </Paragraph>
        </div>
      </div>
    ),
    button: <Button data-testid="ConnectButton">Connect wallet</Button>,
    className: 'w-full md:w-[1144px]',
  },
}

export const CommunitiesSection: Story = {
  args: {
    className: 'mt-2',
    imageSrc: '/images/hero/home-hero-bottom.png',
    title: 'BE PART OF THE COMMUNITIES',
    subtitle: 'CURATED BY THE COLLECTIVE',
    items: [
      'Collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
      "Whether you're a Builder, Backer, or Community Contributor, your badge shows that you belong.",
      'Be part of something bigger, helping shape the future of Bitcoin.',
      "These aren't just collectibles. They are your passport to participation.",
    ],
    button: <CommunityItemButtonHandler color="black" data-testid="LearnMoreButton" />,
    dataTestId: 'HeroCommunitiesComponent',
  },
}
