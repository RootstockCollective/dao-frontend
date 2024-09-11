import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/Button'
import { FaLink } from 'react-icons/fa'
import { userEvent, within, expect, spyOn } from '@storybook/test'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['default', 'green'],
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
  },
}

export const PrimaryWithIcon: Story = {
  args: {
    children: 'Connect wallet',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    startIcon: <FaLink />,
  },
}

export const Secondary: Story = {
  args: {
    children: 'Delegate',
    variant: 'secondary',
    onClick: () => console.log('Clicked'),
  },
}

export const SecondaryWithIcon: Story = {
  args: {
    children: 'Explore Communities',
    variant: 'secondary',
    onClick: () => console.log('Clicked'),
    startIcon: <FaLink fill="var(--color-secondary)" />,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Save & Continue',
    disabled: true,
    onClick: () => console.log('Clicked'),
  },
}

export const Borderless: Story = {
  args: {
    children: 'Treasury',
    variant: 'borderless',
    onClick: () => console.log('Clicked'),
  },
}

export const Tested: Story = {
  args: {
    children: 'Custom Action',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
  },
  play: async ({ canvasElement }) => {
    const consoleLogSpy = spyOn(console, 'log')

    const canvas = within(canvasElement)
    const button = canvas.getByText('Custom Action')
    await userEvent.click(button)

    await expect(consoleLogSpy).toHaveBeenCalledOnce()
    await expect(consoleLogSpy).toHaveBeenCalledWith('Clicked')

    consoleLogSpy.mockRestore()
  },
}
