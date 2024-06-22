import type { Meta, StoryObj } from '@storybook/react'
import { Card } from '.'

const meta = {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Total RIF Volume',
    content: '436.26M RIF',
    footer: '= $14,045.00',
  },
}

export const None: Story = {
  args: {
    title: 'Total RIF Volume',
    content: '-',
    footer: '-',
  },
}

export const WithoutFooter: Story = {
  args: {
    title: 'Total RIF Volume',
    content: '436.26M RIF',
    footer: '',
  },
}
