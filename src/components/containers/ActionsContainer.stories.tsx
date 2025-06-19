import type { Meta, StoryObj } from '@storybook/react'
import { ActionsContainer } from './ActionsContainer'

const meta = {
  title: 'Koto/Components/Container/ActionsContainer',
  component: ActionsContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionsContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithSimpleTitle: Story = {
  args: {
    title: 'Actions Title',
    className: 'bg-v3-bg-accent-80',
    children: (
      <>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Action 1</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded">Action 2</button>
      </>
    ),
  },
}

export const WithComplexTitle: Story = {
  args: {
    title: (
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">Complex Title</span>
        <span className="text-sm text-gray-500">(with subtitle)</span>
      </div>
    ),
    className: 'bg-v3-bg-accent-80',
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-gray-700">Some descriptive text</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Primary Action</button>
      </div>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    title: 'Custom Styled Container',
    className: 'bg-gray-50 border border-gray-200',
    children: <p>Content with custom container styling</p>,
  },
}
