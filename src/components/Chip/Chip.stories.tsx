import type { Meta, StoryObj } from '@storybook/nextjs'
import { Chip } from '@/components/Chip/Chip'

const meta = {
  title: 'Components/Chip',
  component: Chip,
} satisfies Meta<typeof Chip>

export default meta

type Story = StoryObj<typeof meta>

export const ChipDefault: Story = {
  args: {
    children: 'Chip Test',
  },
}
