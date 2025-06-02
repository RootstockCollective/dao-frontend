import type { Meta, StoryObj } from '@storybook/react'
import CollapsibleWithPreview from './CollapsibleWithPreview'

const meta: Meta<typeof CollapsibleWithPreview> = {
  title: 'Components/CollapsibleWithPreview',
  component: CollapsibleWithPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CollapsibleWithPreview>

const ExpandedContent = () => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold">Expanded Content</h3>
    <p>This is the expanded view of the collapsible component.</p>
    <p>You can put any content here, including forms, tables, or other components.</p>
  </div>
)

const CollapsedContent = () => (
  <div className="space-y-2">
    <h3 className="text-xl font-bold text-white">Collapsed Preview</h3>
    <p className="text-white">This is the collapsed preview state.</p>
  </div>
)

export const Default: Story = {
  args: {
    expandedContent: <ExpandedContent />,
    collapsedContent: <CollapsedContent />,
    expandedState: {
      backgroundColor: 'bg-white',
      chevronColor: 'text-gray-600',
    },
    defaultOpen: true,
  },
}

export const InitiallyCollapsed: Story = {
  args: {
    expandedContent: <ExpandedContent />,
    collapsedContent: <CollapsedContent />,
    expandedState: {
      backgroundColor: 'bg-white',
      chevronColor: 'text-gray-600',
    },
    defaultOpen: false,
  },
}

export const WithColorsChange: Story = {
  args: {
    expandedContent: <ExpandedContent />,
    collapsedContent: <CollapsedContent />,
    expandedState: {
      backgroundColor: 'bg-blue-100',
      chevronColor: 'text-blue-600',
    },
    collapsedState: {
      backgroundColor: 'bg-blue-900',
      chevronColor: 'text-blue-100',
    },
    defaultOpen: true,
    onStateChange: isOpen => console.log('State changed:', isOpen),
  },
}
