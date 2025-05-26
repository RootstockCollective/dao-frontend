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
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    width: 400,
    height: 50,
    tileSize: 5,
    speed: 20,
    className: 'border-none',
  },
}

export const ThinLine: Story = {
  args: {
    colors: ['#3b41eb', '#ed6522'],
    tileSize: 3,
    height: 9,
    width: 500,
    className: 'border-none',
    speed: 70,
    dispersion: 0.3,
  },
}
