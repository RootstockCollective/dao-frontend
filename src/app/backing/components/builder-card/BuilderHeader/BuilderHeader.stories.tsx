import { BuilderHeader } from './BuilderHeader'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof BuilderHeader> = {
  title: 'Backing/BuilderHeader',
  component: BuilderHeader,
}

export default meta
type Story = StoryObj<typeof BuilderHeader>

export const Default: Story = {
  args: {
    address: '0x1234567890abcdef',
    name: 'Beefy',
  },
}

export const WithPageLink: Story = {
  args: {
    address: '0x1234567890abcdef',
    name: 'Beefy',
    builderPageLink: 'https://app.rootstockcollective.xyz/',
  },
}
