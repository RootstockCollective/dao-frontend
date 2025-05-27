import { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
} as Meta<typeof ProgressBar>

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  args: {
    children: <p>Lorem ipsum, dolor sit amet</p>,
  },
}

export const Colored: Story = {
  args: {
    children: <p>Colored Progress Bar</p>,
    colors: [
      ['#ff0000', '#00ff00'],
      ['#0000ff', '#ff00f7'],
    ],
    width: 400,
    height: 50,
    tileSize: 17,
    speed: 15,
    className: 'border-none',
    dispersion: 0.3,
  },
}

export const ThinLine: Story = {
  args: {
    colors: ['#25211E', ['#4B5CF0', '#C27265']],
    tileSize: 4,
    height: 8,
    width: 644,
    speed: 20,
    dispersion: 0.3,
    tileAnimationDuration: 0.1,
  },
}
