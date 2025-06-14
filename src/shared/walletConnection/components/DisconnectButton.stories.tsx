import type { Meta, StoryObj } from '@storybook/react'
import { DisconnectButton } from './DisconnectButton'

const meta = {
  title: 'Koto/DAO/DisconnectButton',
  component: DisconnectButton,
} satisfies Meta<typeof DisconnectButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
