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
  BiCopyIcon,
  BsCopyIcon,
  CircleCheckIcon,
  CloseIcon,
  ErrorIcon,
  ExclamationCircleIcon,
  UsersIcon,
  BadgeCheckIcon,
  SpinnerIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  ArrowUpRightIcon,
  ExternalLinkIcon,
  TwitterXIcon,
  DiscordIcon,
  LinkIcon,
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
    <div>
      <h4>Users</h4>
      <UsersIcon {...args} />
    </div>
    <div>
      <h4>Badge Check</h4>
      <BadgeCheckIcon {...args} />
    </div>
    <div>
      <h4>Spinner</h4>
      <SpinnerIcon {...args} />
    </div>
    <div>
      <h4>Minus Circle</h4>
      <MinusCircleIcon {...args} />
    </div>
    <div>
      <h4>Plus Circle</h4>
      <PlusCircleIcon {...args} />
    </div>
    <div>
      <h4>Arrow Up Right</h4>
      <ArrowUpRightIcon {...args} />
    </div>
    <div>
      <h4>External Link</h4>
      <ExternalLinkIcon {...args} />
    </div>
    <div>
      <h4>Twitter X</h4>
      <TwitterXIcon {...args} />
    </div>
    <div>
      <h4>Discord</h4>
      <DiscordIcon {...args} />
    </div>
    <div>
      <h4>Link</h4>
      <LinkIcon {...args} />
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
