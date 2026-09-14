import type { Meta, StoryObj } from '@storybook/nextjs'

import { MyRewardsBanner } from './MyRewardsBanner'

const meta: Meta<typeof MyRewardsBanner> = {
  title: 'Components/MyRewards/MyRewardsBanner',
  component: MyRewardsBanner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hero banner for the My Rewards page: background artwork, page title, intro copy, whitepaper link and a dismiss action persisted in localStorage.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="bg-v3-bg-accent-100 p-6">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MyRewardsBanner>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
