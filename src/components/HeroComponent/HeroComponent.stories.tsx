import type { Meta, StoryObj } from '@storybook/react'
import { HeroComponent } from './HeroComponent'
import { Button } from '../ButtonNew'

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
      "Clarify your project's purpose on Discourse",
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
