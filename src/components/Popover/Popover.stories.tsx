import type { Meta, StoryObj } from '@storybook/react'
import { Popover } from './Popover'

const meta = {
  title: 'Components/Popover',
  component: Popover,
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Hover me',
    content: 'Popover content',
  },
}

export const WithCustomContent: Story = {
  args: {
    children: 'Click me',
    customContent: (
      <div className="bg-white rounded-lg border border-white/20 p-4 shadow-lg">
        <h3 className="font-bold mb-2 text-black">Custom Content</h3>
        <p className="text-black">This is a custom styled content block</p>
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">Action</button>
      </div>
    ),
    trigger: 'click',
    position: 'bottom',
    hasCaret: true,
  },
}
