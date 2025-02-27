import { Meta, StoryObj } from '@storybook/react'
import { ArrowDown } from './ArrowDown'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'

const meta: Meta<typeof ArrowDown> = {
  title: 'Icons/ArrowDown',
  component: ArrowDown,
  args: {
    size: DEFAULT_ICON_SIZE,
    fill: DEFAULT_ICON_COLOR,
    'aria-label': 'Arrow Down Icon',
  },
  argTypes: {
    size: { control: 'number', description: 'Size of the icon in pixels' },
    fill: { control: 'color', description: 'Fill color of the icon' },
    'aria-label': { control: 'text', description: 'Accessible label for the icon' },
  },
}

export default meta

type Story = StoryObj<typeof ArrowDown>

export const Default: Story = {}

export const CustomSizeAndColor: Story = {
  args: {
    size: 48,
    fill: '#FF6347', // Tomato color
  },
}
