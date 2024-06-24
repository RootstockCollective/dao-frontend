import { within, expect, spyOn, userEvent } from '@storybook/test'
import { Header } from '@/components/Header'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Header',
  component: Header
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: '0x3324A6b051cBCb5e140A6c387e0FC07300F9b444',
    shortAddress: '0x33...444',
    onLogoutClick: () => console.log('Test')
  },
  play: async ({ canvasElement }) => {
    const consoleMock = spyOn(console, 'log')
    const canvas = within(canvasElement)
    
    const logoutElement = canvas.getByTestId('Logout_Icon')
    await userEvent.click(logoutElement)
    
    await expect(consoleMock).toHaveBeenCalledOnce()
  }
}
