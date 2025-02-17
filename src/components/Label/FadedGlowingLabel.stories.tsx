import type { Meta, StoryObj } from '@storybook/react'
import { FadedGlowingLabel } from './GlowingLabel'

const meta = {
  title: 'Components/GlowingLabel',
  component: FadedGlowingLabel,
} satisfies Meta<typeof FadedGlowingLabel>

export default meta

type Story = StoryObj<typeof meta>

export const FadedGlowingLabelDefault: Story = {
  args: {
    children: 'Estimated Rewards',
    showGlow: true,
  },
}
