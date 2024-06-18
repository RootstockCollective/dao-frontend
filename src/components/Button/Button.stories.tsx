import type { Meta, StoryObj } from '@storybook/react'
import { Button, VARIANTS, TYPES } from '@/components/Button'
import { FaLink } from 'react-icons/fa'
import { userEvent, within, expect, spyOn } from '@storybook/test'

const meta = {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
  }
}

export const WithIcon: Story = {
  args: {
    text: 'Connect wallet',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    startIcon: <FaLink />,
  }
}

export const Rounded: Story = {
  args: {
    text: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    type: TYPES.Circle
  },
}

export const White: Story = {
  args: {
    text: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    variants: VARIANTS.White,
  },
}

export const WhiteWithIcon: Story = {
  args: {
    text: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    variants: VARIANTS.White,
    startIcon: <FaLink fill='black' />,
  },
}

export const Tested: Story = {
  args: {
    text: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
  },
  play: async ({ canvasElement }) => {
    const consoleLogSpy = spyOn(console, 'log')

    const canvas = within(canvasElement)
    const button = canvas.getByText('CUSTOM ACTION')
    await userEvent.click(button)

    await expect(consoleLogSpy).toHaveBeenCalledOnce()
    await expect(consoleLogSpy).toHaveBeenCalledWith('Clicked')

    consoleLogSpy.mockRestore()
  }
}