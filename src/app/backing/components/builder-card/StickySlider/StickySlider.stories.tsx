import type { Meta, StoryObj } from '@storybook/react'
import { StickySlider } from './StickySlider'
import { useState } from 'react'

const meta: Meta<typeof StickySlider> = {
  title: 'Components/StickySlider',
  component: StickySlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StickySlider>

// Wrapper component to handle state
const StickySliderWithState = (args: any) => {
  const [value, setValue] = useState([50])
  return <StickySlider {...args} value={value} onValueChange={setValue} />
}

export const Default: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 0.01,
  },
}

export const WithCustomMax: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 200,
    step: 0.01,
  },
}

export const WithCustomStep: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 1,
  },
}

export const WithCustomTicks: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 0.01,
    ticks: [0, 20, 40, 60, 80, 100],
  },
}

export const WithCustomSizes: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 0.01,
    thumbSize: 16,
    ticksEdgesSize: 12,
  },
}

export const WithCustomStickyThreshold: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 0.01,
    stickyThreshold: 5,
  },
}

export const WithCustomClassName: Story = {
  render: args => <StickySliderWithState {...args} />,
  args: {
    max: 100,
    step: 0.01,
    className: 'w-[300px]',
  },
}
