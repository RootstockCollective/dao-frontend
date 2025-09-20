import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { SelectableItem } from './SelectableItem'

const meta: Meta<typeof SelectableItem> = {
  title: 'Components/SelectableItem',
  component: SelectableItem,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{ backgroundColor: '#000000', padding: '20px', minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Whether the item is selected',
    },
    variant: {
      control: 'radio',
      options: ['square', 'round'],
      description: 'Visual variant of the selectable item',
    },
    option: {
      control: 'object',
      description: 'Option object with label and value',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function when item is clicked',
    },
  },
}

export default meta

type Story = StoryObj<typeof SelectableItem>

// Reusable render function with interactive state
const InteractiveRender = (args: any) => {
  const [selected, setSelected] = useState(args.selected || false)
  return (
    <SelectableItem
      {...args}
      selected={selected}
      onClick={value => {
        setSelected(!selected)
        args.onClick?.(value)
      }}
    />
  )
}

export const SquareDefault: Story = {
  render: InteractiveRender,
  args: {
    option: { label: 'Square item (multiple selection)', value: 'square-item' },
    selected: false,
    variant: 'square',
  },
}

export const SquareSelected: Story = {
  render: InteractiveRender,
  args: {
    option: { label: 'Selected square item', value: 'selected-square' },
    selected: true,
    variant: 'square',
  },
}

export const RoundDefault: Story = {
  render: InteractiveRender,
  args: {
    option: { label: 'Round item (single selection)', value: 'round-item' },
    selected: false,
    variant: 'round',
  },
}

export const RoundSelected: Story = {
  render: InteractiveRender,
  args: {
    option: { label: 'Selected round item', value: 'selected-round' },
    selected: true,
    variant: 'round',
  },
}

export const Interactive: Story = {
  render: InteractiveRender,
  args: {
    option: { label: 'Interactive item', value: 'interactive-item' },
    selected: false,
    variant: 'square',
  },
}
