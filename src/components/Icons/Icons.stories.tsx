import { Meta, StoryObj } from '@storybook/react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleIcon,
  ArrowUpSFillIcon,
  ArrowDownSFillIcon,
  BiCopyIcon,
  BsCopyIcon,
  CircleCheckIcon,
  CloseIcon,
  ErrorIcon,
  ExclamationCircleIcon,
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
      <h4>Close</h4>
      <CloseIcon {...args} />
    </div>
    <div>
      <h4>Circle Check</h4>
      <CircleCheckIcon {...args} />
    </div>
    <div>
      <h4>BsCopy</h4>
      <BsCopyIcon {...args} />
    </div>
    <div>
      <h4>BiCopy</h4>
      <BiCopyIcon {...args} />
    </div>
    <div>
      <h4>Error</h4>
      <ErrorIcon {...args} />
    </div>
    <div>
      <h4>Exclamation Circle</h4>
      <ExclamationCircleIcon {...args} />
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
