import type { Meta, StoryObj } from '@storybook/react'
import { InfoContainer } from './InfoContainer'

const meta = {
  title: 'Koto/Backing/Container/InfoContainer',
  component: InfoContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InfoContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithTextContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Information Title</h3>
        <p className="text-gray-700">
          This is some informative text that provides details about something important.
        </p>
      </div>
    ),
  },
}

export const WithListContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Key Points</h3>
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
    children: <p>Content with custom container styling</p>,
    className: 'bg-blue-50 border-2 border-blue-200',
  },
}
