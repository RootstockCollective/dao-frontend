import type { Meta, StoryObj } from '@storybook/react'
import { BackingInfoContainer } from './BackingInfoContainer'

const meta = {
  title: 'Koto/Backing/Container/BackingInfoContainer',
  component: BackingInfoContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BackingInfoContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithTextContent: Story = {
  args: {
    title: 'Information Title',
    children: (
      <div className="space-y-4">
        <p className="text-gray-700">
          This is some informative text that provides details about something important.
        </p>
      </div>
    ),
  },
}

export const WithListContent: Story = {
  args: {
    title: 'Key Points',
    children: (
      <div className="space-y-4">
        <ul className="list-disc list-inside space-y-2">
          <li>First important point</li>
          <li>Second important point</li>
          <li>Third important point</li>
        </ul>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    title: 'Custom Styled Container',
    children: <p>Content with custom container styling</p>,
    className: 'bg-blue-50 border-2 border-blue-200',
  },
}
