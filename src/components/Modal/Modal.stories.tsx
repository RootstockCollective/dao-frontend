import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from '@/components/Modal/Modal'
import { DisconnectWalletModal } from './DisconnectWalletModal'

const meta = {
  component: Modal,
  title: 'Components/Modal',
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'test',
    onClose: () => console.log('Test'),
    width: 500,
  },
  render: () => (
    <DisconnectWalletModal
      onCancel={() => console.log('test')}
      onClose={() => console.log('test')}
      onConfirm={() => console.log('Confirmed')}
    />
  ),
}
