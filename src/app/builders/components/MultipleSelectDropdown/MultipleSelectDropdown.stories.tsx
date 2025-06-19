import type { Meta, StoryObj } from '@storybook/react'
import { MultipleSelectDropdown } from './MultipleSelectDropdown'
import { SelectorOption } from './MultipleSelectDropdown'
import { Button } from '@/components/Button'
import { useState } from 'react'

const meta: Meta<typeof MultipleSelectDropdown> = {
  title: 'Builders/MultipleSelectDropdown',
  component: MultipleSelectDropdown,
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

type Story = StoryObj<typeof MultipleSelectDropdown>

const defaultOptions: SelectorOption[] = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2', sublabel: 'Description 2' },
  { id: '3', label: 'Option 3', sublabel: 'Description 3' },
]

const Template = (args: any) => {
  const [selected, setSelected] = useState<string[]>(['1'])
  return (
    <MultipleSelectDropdown
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
