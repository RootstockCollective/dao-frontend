import type { Meta, StoryObj } from '@storybook/react'
import { Button,  } from '@/components/Button'
import { FaLink } from 'react-icons/fa'
import { userEvent, within, expect, spyOn } from '@storybook/test'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['default','green'],
    },
  }
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

export const PrimaryWithIcon: Story = {
  args: {
    text: 'Connect wallet',
    fullWidth: false,
    onClick: () => console.log('Clicked'),
    startIcon: <FaLink />,
  }
}

export const Secondary: Story = {
  args: {
    text: 'Delegate',
    variant: 'secondary',
    onClick: () => console.log('Clicked'),
  }
}

export const SecondaryWithIcon: Story = {
  args: {
    text: 'Explore Communities',
    variant: 'secondary',
    onClick: () => console.log('Clicked'),
    startIcon: <FaLink fill='var(--color-secondary)' />,
  }
}

export const Disabled: Story = {
  args: {
    text: 'Save & Continue',
    variant: 'disabled',
    onClick: () => console.log('Clicked'),
  }
}

export const TransparentOutline: Story = {
  args: {
    text: 'Treasury',
    variant: 'transparent',
    onClick: () => console.log('Clicked'),
  }
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
    const button = canvas.getByText('Custom Action')
    await userEvent.click(button)

    await expect(consoleLogSpy).toHaveBeenCalledOnce()
    await expect(consoleLogSpy).toHaveBeenCalledWith('Clicked')

    consoleLogSpy.mockRestore()
  }
}
