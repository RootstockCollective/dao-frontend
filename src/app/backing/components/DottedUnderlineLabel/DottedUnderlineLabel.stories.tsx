import type { Meta, StoryObj } from '@storybook/react'
import { DottedUnderlineLabel } from './DottedUnderlineLabel'

const meta = {
  title: 'Backing/DottedUnderlineLabel',
  component: DottedUnderlineLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The text content to be displayed with the dotted underline',
      defaultValue: 'USD',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to be applied to the component',
      defaultValue: '',
    },
  },
} satisfies Meta<typeof DottedUnderlineLabel>

export default meta
type Story = StoryObj<typeof DottedUnderlineLabel>

export const Default: Story = {
  args: {
    children: 'USD',
  },
}

export const WithCustomText: Story = {
  args: {
    children: 'USDT',
  },
}

export const CustomTextAndClass: Story = {
  args: {
    children: 'USDC',
    className: 'text-xl text-blue-500',
  },
}
