import { Meta, StoryObj } from '@storybook/react'
import { CopyButton } from './CopyButton'
import { shortAddress } from '@/lib/utils'
import { BsCopy } from 'react-icons/bs'
import { action } from '@storybook/addon-actions'
import { spyOn } from '@storybook/test'

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
} satisfies Meta<typeof CopyButton>

export default meta

type Story = StoryObj<typeof meta>

const address = '0xB62BD53308fb2834b3114a5f725D0382CBe9f008'

export const Default: Story = {
  args: {
    copyText: address,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const CustomText: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const CustomStyledText: Story = {
  args: {
    copyText: address,
    label: <span className="underline">{shortAddress(address)}</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const NoIcon: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    icon: null,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const CustomIcon: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    icon: <BsCopy />,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const CustomSuccessMessage: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    successLabel: <span className="underline">Congrats!</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
}
export const DefaultError: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  play: async () => {
    spyOn(navigator.clipboard, 'writeText').mockImplementation(() => {
      return Promise.reject(new Error('Clipboard error'))
    })
  },
}
export const CustomError: Story = {
  args: {
    copyText: address,
    label: shortAddress(address),
    errorLabel: <span className="font-extrabold">Catastrophe</span>,
    onCopySuccess: action('onCopySuccess'),
    onCopyFailure: action('onCopyFailure'),
  },
  play: async () => {
    spyOn(navigator.clipboard, 'writeText').mockImplementation(() => {
      return Promise.reject(new Error('Clipboard error'))
    })
  },
}
