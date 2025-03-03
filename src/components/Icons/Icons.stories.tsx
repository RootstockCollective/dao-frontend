import { Meta, StoryObj } from '@storybook/react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleIcon,
  ArrowUpSFillIcon,
  ArrowDownSFillIcon,
  BitcoinIcon,
  PowerOffIcon,
  SearchIcon,
  XCircleIcon,
} from './'
import type { IconProps } from './types'

const meta: Meta = {
  title: 'Icons/Icons',
  args: {},
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
      <ArrowDownIcon {...args} />
    </div>
    <div>
      <h4>Arrow Up</h4>
      <ArrowUpIcon {...args} />
    </div>
    <div>
      <h4>Circle</h4>
      <CircleIcon {...args} />
    </div>
    <div>
      <h4>Arrow Up S Fill</h4>
      <ArrowUpSFillIcon {...args} />
    </div>
    <div>
      <h4>Arrow Down S Fill</h4>
      <ArrowDownSFillIcon {...args} />
    </div>
    <div>
      <h4>Bitcoin</h4>
      <BitcoinIcon {...args} />
    </div>
    <div>
      <h4>Power Off</h4>
      <PowerOffIcon {...args} />
    </div>
    <div>
      <h4>X Circle</h4>
      <XCircleIcon {...args} />
    </div>
    <div>
      <h4>Search</h4>
      <SearchIcon {...args} />
    </div>
  </div>
)

export const DefaultIcons: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {},
}

export const CustomSizeAndColor: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {
    size: 48,
    fill: '#FF6347', // Tomato color
  },
}
