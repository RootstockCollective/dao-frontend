import type { Meta, StoryObj } from '@storybook/react'
import { LabeledContent } from './LabeledContent'

const meta: Meta<typeof LabeledContent> = {
  title: 'Backing/LabeledContent',
  component: LabeledContent,
}

export default meta

type Story = StoryObj<typeof LabeledContent>

export const Default: Story = {
  args: {
    label: 'Label',
    children: 'Content',
  },
}
