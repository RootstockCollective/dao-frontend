import type { Meta, StoryObj } from '@storybook/nextjs'

import { StepDots } from './StepDots'

const meta: Meta<typeof StepDots> = {
  title: 'Koto/StepDots',
  component: StepDots,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    total: { control: { type: 'number', min: 1, max: 6 } },
    current: { control: { type: 'number', min: 0, max: 5 } },
  },
  decorators: [
    Story => (
      <div className="bg-text-80 p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const FirstOfThree: Story = {
  args: { total: 3, current: 0 },
}

export const SecondOfThree: Story = {
  args: { total: 3, current: 1 },
}

export const LastOfThree: Story = {
  args: { total: 3, current: 2 },
}

export const TwoStepFlow: Story = {
  args: { total: 2, current: 0 },
}

/** A single-step flow renders nothing: one segment communicates no progress. */
export const SingleStepRendersNothing: Story = {
  args: { total: 1, current: 0 },
}
