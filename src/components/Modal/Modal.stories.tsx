import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from '@/components/Modal/Modal'
import { DisconnectWalletModal } from './DisconnectWalletModal'

const meta = {
  component: Modal,
  title: 'Components/Modals/Modal',
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'test',
    onClose: () => console.log('Test'),
    className: 'w-[756px]',
  },
  render: () => (
    <DisconnectWalletModal
      onCancel={() => console.log('test')}
      onClose={() => console.log('test')}
      onConfirm={() => console.log('Confirmed')}
    />
  ),
}
