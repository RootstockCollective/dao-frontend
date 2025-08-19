import type { Meta, StoryObj } from '@storybook/nextjs'
import { SelectDropdown } from './Select'
import { useState } from 'react'

const meta: Meta<typeof SelectDropdown> = {
  title: 'KOTO/Components/Select',
  component: SelectDropdown,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of options to display in the dropdown',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback function when value changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const options = [
  'Lorem ipsum',
  'dolor sit amet',
  'consectetur',
  'adipisicing',
  'adipisicing elit',
  'Aliquam, et!',
]
export const Default: Story = {
  args: {
    placeholder: 'Select an option...',
    options,
  },
  render() {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="max-w-80">
        <SelectDropdown onValueChange={setValue} options={options} value={value} />
        <p className="mt-4 text-sm text-gray-600">Selected value: {value || 'None'}</p>
      </div>
    )
  },
}

export const WithPreselectedValue: Story = {
  args: {
    placeholder: 'Select an option...',
    options,
  },
  render() {
    const [value, setValue] = useState<string>('consectetur')
    return (
      <div>
        <SelectDropdown className="max-w-80" onValueChange={setValue} options={options} value={value} />
        <p className="mt-4 text-sm text-gray-600">Selected value: {value}</p>
      </div>
    )
  },
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Choose your favorite framework...',
    options: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'],
  },
  render() {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="max-w-80">
        <SelectDropdown
          onValueChange={setValue}
          options={['React', 'Vue', 'Angular', 'Svelte', 'Next.js']}
          value={value}
          placeholder="Choose your favorite framework..."
        />
        <p className="mt-4 text-sm text-gray-600">Selected value: {value || 'None'}</p>
      </div>
    )
  },
}

export const LongOptions: Story = {
  args: {
    placeholder: 'Select a very long option...',
    options: [
      'This is a very long option that might overflow',
      'Another extremely long option to test text wrapping',
      'Short',
      'Medium length option',
      'Yet another incredibly long option name that goes on and on',
    ],
  },
  render() {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="max-w-80">
        <SelectDropdown
          onValueChange={setValue}
          options={[
            'This is a very long option that might overflow',
            'Another extremely long option to test text wrapping',
            'Short',
            'Medium length option',
            'Yet another incredibly long option name that goes on and on',
          ]}
          value={value}
          placeholder="Select a very long option..."
        />
        <p className="mt-4 text-sm text-gray-600">Selected value: {value || 'None'}</p>
      </div>
    )
  },
}

export const WithDeselectFunction: Story = {
  args: {
    placeholder: 'Click selected item to deselect...',
    options: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
  },
  render() {
    const [value, setValue] = useState<string>('Banana')
    const handleValueChange = (newValue: string) => {
      setValue(newValue === '' ? '' : newValue)
    }
    return (
      <div className="max-w-80">
        <SelectDropdown
          onValueChange={handleValueChange}
          options={['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']}
          value={value}
          placeholder="Click selected item to deselect..."
        />
        <p className="mt-4 text-sm text-gray-600">
          Selected value: {value || 'None'}
          <span className="text-xs block mt-1">💡 Click on the selected item to deselect it</span>
        </p>
      </div>
    )
  },
}
