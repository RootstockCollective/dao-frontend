import { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/ButtonNew',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    disabled: true,
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    disabled: true,
  },
}

export const SecondaryOutline: Story = {
  args: {
    variant: 'secondary-outline',
    children: 'Secondary Outline Button',
  },
}

export const SecondaryOutlineDisabled: Story = {
  args: {
    variant: 'secondary-outline',
    children: 'Secondary Outline Button',
    disabled: true,
  },
}
