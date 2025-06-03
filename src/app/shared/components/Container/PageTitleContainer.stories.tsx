import type { Meta, StoryObj } from '@storybook/react'
import { PageTitleContainer } from './PageTitleContainer'

const meta = {
  title: 'Koto/Backing/Container/PageTitleContainer',
  component: PageTitleContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageTitleContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithLeftAndRightText: Story = {
  args: {
    leftText: 'Left Title',
    rightText: 'Right Text',
  },
}

export const WithLeftTextOnly: Story = {
  args: {
    leftText: 'Left Title Only',
  },
}

export const WithCustomChildren: Story = {
  args: {
    children: (
      <div className="flex justify-between w-full">
        <span className="text-2xl font-bold">Custom Content</span>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Action</button>
      </div>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    leftText: 'Custom Styled',
    rightText: 'Right Text',
    className: 'bg-gray-100 rounded-lg shadow-md',
  },
}
