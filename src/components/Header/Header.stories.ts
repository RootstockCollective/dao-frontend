import { Meta, StoryObj } from '@storybook/nextjs'
import { expect, within } from 'storybook/test'

import { Header } from '@/components/Header'

const meta = {
  title: 'Components/Header',
  component: Header,
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const logoutElement = canvas.getByText('test')
    await expect(logoutElement).toBeDefined()
  },
}
