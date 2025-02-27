import { Meta, StoryObj } from '@storybook/react'
import { ArrowDown, ArrowUp, Circle, ArrowUpSFill, ArrowDownSFill, ArrowUpRight, ExternalLink } from './'
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from './constants'
import type { IconProps } from './types'

const meta: Meta = {
  title: 'Icons/Icons',
  args: {
    size: DEFAULT_ICON_SIZE,
    fill: DEFAULT_ICON_COLOR,
    'aria-label': 'Icon',
  },
  argTypes: {
    size: { control: 'number', description: 'Size of the icon in pixels' },
    fill: { control: 'color', description: 'Fill color of the icon' },
    'aria-label': { control: 'text', description: 'Accessible label for the icon' },
  },
}

export default meta

type Story = StoryObj

const IconsShowcase = (args: IconProps) => (
  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
    <div>
      <h4>Arrow Down</h4>
      <ArrowDown {...args} />
    </div>
    <div>
      <h4>Arrow Up</h4>
      <ArrowUp {...args} />
    </div>
    <div>
      <h4>Circle</h4>
      <Circle {...args} />
    </div>
    <div>
      <h4>Arrow Up S Fill</h4>
      <ArrowUpSFill {...args} />
    </div>
    <div>
      <h4>Arrow Down S Fill</h4>
      <ArrowDownSFill {...args} />
    </div>
    <div>
      <h4>Arrow Up Right</h4>
      <ArrowUpRight {...args} />
    </div>
    <div>
      <h4>External Link</h4>
      <ExternalLink {...args} />
    </div>
  </div>
)

export const DefaultIcons: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {
    size: DEFAULT_ICON_SIZE,
    fill: DEFAULT_ICON_COLOR,
  },
}

export const CustomSizeAndColor: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {
    size: 48,
    fill: '#FF6347', // Tomato color
  },
}
