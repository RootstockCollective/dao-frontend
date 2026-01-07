import type { Meta, StoryObj } from '@storybook/nextjs'
import { FiatTooltipLabel } from './FiatTooltipLabel'

const meta: Meta<typeof FiatTooltipLabel> = {
  title: 'Components/Tooltip/FiatTooltipLabel',
  component: FiatTooltipLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FiatTooltipLabel>

export const Default: Story = {
  args: {
    tooltip: {
      text: 'This is a tooltip for USD label',
      side: 'top',
    },
  },
  decorators: [
    Story => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          backgroundColor: 'maroon',
        }}
      >
        <Story />
      </div>
    ),
  ],
}
