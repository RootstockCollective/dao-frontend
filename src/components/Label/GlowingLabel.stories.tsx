import type { Meta, StoryObj } from '@storybook/nextjs'
import { GlowingLabel } from './GlowingLabel'

const meta = {
  title: 'Components/GlowingLabel',
  component: GlowingLabel,
} satisfies Meta<typeof GlowingLabel>

export default meta

type Story = StoryObj<typeof meta>

export const GlowingLabelDefault: Story = {
  args: {
    children: 'Early Adopters',
    showGlow: true,
    faded: false,
  },
}
