import { FC } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { CopyButton, CopyButtonProps } from './CopyButton'
import { shortAddress } from '@/lib/utils/utils'
import { BsCopyIcon } from '../Icons'
import { action } from '@storybook/addon-actions'
import { spyOn } from '@storybook/test'

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
} satisfies Meta<typeof CopyButton>

export default meta

type Story = StoryObj<typeof meta>

const address = '0xB62BD53308fb2834b3114a5f725D0382CBe9f008'

/**
 * Demonstrates the CopyButton surrounded by components from left and right
 */
const Surrounding: FC<CopyButtonProps> = args => (
  <div className="flex gap-4">
    <span className="border">Leading</span>
    <CopyButton {...args} />
    <span className="border">Trailing</span>
  </div>
)

export const Default: Story = {
  args: {
    copyText: address,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const CustomText: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const CustomStyledText: Story = {
  args: {
    copyText: address,
    children: <span className="underline">{shortAddress(address)}</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const NoIcon: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    icon: null,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const CustomIcon: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    icon: <BsCopyIcon />,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const CustomSuccessMessage: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    successLabel: <span className="underline">Congrats!</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
}
export const DefaultError: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
  play: async () => {
    spyOn(navigator.clipboard, 'writeText').mockImplementation(() => {
      return Promise.reject(new Error('Clipboard error'))
    })
  },
}
export const CustomError: Story = {
  args: {
    copyText: address,
    children: shortAddress(address),
    errorLabel: <span className="font-extrabold">Catastrophe</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  render: args => <Surrounding {...args} />,
  play: async () => {
    spyOn(navigator.clipboard, 'writeText').mockImplementation(() => {
      return Promise.reject(new Error('Clipboard error'))
    })
  },
}
