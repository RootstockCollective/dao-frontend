import type { Meta, StoryObj } from '@storybook/react'
import { DropdownSelector, SelectorOption } from './DropdownSelector'
import { Button } from '@/components/Button'
import { useState } from 'react'

const meta: Meta<typeof DropdownSelector> = {
  title: 'Builders/DropdownSelector',
  component: DropdownSelector,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    options: { control: 'object' },
    className: { control: 'text' },
  },
}

export default meta

type Story = StoryObj<typeof DropdownSelector>

const defaultOptions: SelectorOption[] = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2', sublabel: 'Description 2' },
  { id: '3', label: 'Option 3', sublabel: 'Description 3' },
]

const Template = (args: any) => {
  const [selected, setSelected] = useState<string[]>(['1'])
  return (
    <DropdownSelector
      {...args}
      trigger={<Button>Select Options</Button>}
      selected={selected}
      onChange={setSelected}
    />
  )
}

export const Default: Story = {
  render: Template,
  args: {
    title: 'Select Options',
    options: defaultOptions,
    align: 'end',
    className: '',
  },
}
