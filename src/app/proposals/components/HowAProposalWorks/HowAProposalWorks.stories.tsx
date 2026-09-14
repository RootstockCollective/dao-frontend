import type { Meta, StoryObj } from '@storybook/nextjs'

import { HowAProposalWorks } from './HowAProposalWorks'

const meta: Meta<typeof HowAProposalWorks> = {
  title: 'Components/Proposals/HowAProposalWorks',
  component: HowAProposalWorks,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Explains the proposal lifecycle in six steps. Collapsible, with the open/closed state persisted in localStorage.',
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

type Story = StoryObj<typeof HowAProposalWorks>

export const Default: Story = {}
