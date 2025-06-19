import type { Meta, StoryObj } from '@storybook/react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownValue,
} from './SingleSelectDropdown'
import { useState } from 'react'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/SingleSelectDropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current selected value',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback function when value changes',
    },
  },
}

export default meta

const defaultOptions = [
  { id: '1', content: 'Option 1' },
  { id: '2', content: 'Option 2' },
  { id: '3', content: 'Option 3' },
  { id: '4', content: 'Option 4' },
  { id: '5', content: 'Best option for sure' },
]

// Wrapper component that manages its own state
const DefaultDropdownWrapper = () => {
  const [value, setValue] = useState('1')

  return (
    <div className="w-64">
      <Dropdown value={value} onValueChange={setValue}>
        <DropdownTrigger>
          <DropdownValue />
        </DropdownTrigger>
        <DropdownContent>
          {defaultOptions.map(option => (
            <DropdownItem key={option.id} value={option.id}>
              {option.content}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  )
}

const CustomizedDropdownWrapper = () => {
  const [value, setValue] = useState('star')
  const customOptions = [
    {
      id: 'star',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">⭐</span>
          <span className="font-semibold text-yellow-600">Starred Option</span>
        </div>
      ),
    },
    {
      id: 'check',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-green-500">✅</span>
          <span className="font-bold text-green-700">Approved</span>
          <span className="text-xs text-gray-500">(verified)</span>
        </div>
      ),
    },
    {
      id: 'multiline',
      content: (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📝</span>
            <span className="font-semibold text-blue-700">Multi-line Option</span>
          </div>
          <div className="text-xs text-gray-500 ml-6">With a detailed description below</div>
        </div>
      ),
    },
    {
      id: 'styled',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-purple-500">🎨</span>
          <span className="italic font-medium text-purple-600">Styled Option</span>
        </div>
      ),
    },
    {
      id: 'warning',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-orange-500">⚠️</span>
          <span className="font-medium text-orange-700">Warning State</span>
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">New</span>
        </div>
      ),
    },
  ]

  return (
    <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customized Dropdown</h3>
      <Dropdown value={value} onValueChange={setValue}>
        <DropdownTrigger className="bg-white border border-gray-200 shadow-sm">
          <DropdownValue />
        </DropdownTrigger>
        <DropdownContent>
          {customOptions.map(option => (
            <DropdownItem key={option.id} value={option.id}>
              {option.content}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  )
}

type Story = StoryObj<typeof Dropdown>

export const Default: Story = {
  render: () => <DefaultDropdownWrapper />,
}

export const Customized: Story = {
  render: () => <CustomizedDropdownWrapper />,
}
