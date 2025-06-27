import type { Meta, StoryObj } from '@storybook/react'
import HeroComponent from './HeroComponent'

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

/* eslint-disable quotes */
export const Proposal: Story = {
  args: {
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
    buttonText: 'Create a proposal',
    buttonOnClick: () => console.log('Button clicked'),
  },
}

export const Delegation: Story = {
  args: {
    title: 'Delegate your voting power',
    subtitle: 'to influence what gets built',
    items: [
      'You are only delegating your own voting power',
      'Your tokens stay in your wallet',
      'You save on gas cost while being represented',
      'Your Rewards will keep accumulating as usual',
    ],
  },
}
