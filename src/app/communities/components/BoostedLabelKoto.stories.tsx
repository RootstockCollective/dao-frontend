import type { Meta, StoryObj } from '@storybook/react'
import { BoostedLabelKoto } from './BoostedLabelKoto'

const meta: Meta<typeof BoostedLabelKoto> = {
  title: 'KOTO/Backing/Components/BoostedLabelKoto',
  component: BoostedLabelKoto,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'The text content to display in the label',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: '20% rewards boost',
  },
}

export const LongText: Story = {
  args: {
    text: 'This is a much longer text to demonstrate how the component handles extended content',
  },
}

export const ShortText: Story = {
  args: {
    text: 'Hi',
  },
}

export const EmptyText: Story = {
  args: {
    text: '',
  },
}
