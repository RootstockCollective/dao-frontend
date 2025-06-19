import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SelectorHeaderCell } from './SelectorHeaderCell'

const meta: Meta<typeof SelectorHeaderCell> = {
  title: 'Koto/Builders/Table/SelectorHeaderCell',
  component: SelectorHeaderCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof SelectorHeaderCell>

export const Default: Story = {
  render: () => {
    const [hasSelections, setHasSelections] = useState(false)

    return (
      <div className="w-[300px] p-4 bg-[#37322F]">
        <SelectorHeaderCell
          hasSelections={hasSelections}
          onClick={() => setHasSelections(prev => !prev)}
          className="cursor-pointer hover:outline-1 hover:outline-white transition-colors p-2 rounded"
        />
        <div className="mt-4 text-sm text-white-600">
          Current state: {hasSelections ? 'Has selections' : 'No selections'}
        </div>
      </div>
    )
  },
}

export const WithSelections: Story = {
  render: () => (
    <div className="w-[300px] p-4 bg-[#37322F]">
      <SelectorHeaderCell hasSelections={true} className="p-2" />
    </div>
  ),
}

export const WithoutSelections: Story = {
  render: () => (
    <div className="w-[300px] p-4 bg-[#37322F]">
      <SelectorHeaderCell hasSelections={false} className="p-2" />
    </div>
  ),
}

export const InTable: Story = {
  render: () => {
    const [selections, setSelections] = useState<string[]>([])

    return (
      <div className="w-[600px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#37322F]">
              <th className="border border-white-800 p-2">
                <SelectorHeaderCell
                  hasSelections={selections.length > 0}
                  onClick={() => setSelections(prev => (prev.length > 0 ? [] : ['1', '2', '3']))}
                  className="cursor-pointer hover:outline-1 hover:outline-white transition-colors"
                />
              </th>
              <th className="border border-gray-200 p-2 text-left">Name</th>
              <th className="border border-gray-200 p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-2">
                <SelectorHeaderCell
                  hasSelections={selections.includes('1')}
                  className="cursor-pointer hover:outline-1 hover:outline-white transition-colors"
                  onClick={() =>
                    setSelections(prev =>
                      prev.includes('1') ? prev.filter(id => id !== '1') : [...prev, '1'],
                    )
                  }
                />
              </td>
              <td className="border border-gray-200 p-2">John Doe</td>
              <td className="border border-gray-200 p-2">Developer</td>
            </tr>
            <tr>
              <td className="border border-gray-200 p-2">
                <SelectorHeaderCell
                  hasSelections={selections.includes('2')}
                  className="cursor-pointer hover:outline-1 hover:outline-white transition-colors"
                  onClick={() =>
                    setSelections(prev =>
                      prev.includes('2') ? prev.filter(id => id !== '2') : [...prev, '2'],
                    )
                  }
                />
              </td>
              <td className="border border-gray-200 p-2">Jane Smith</td>
              <td className="border border-gray-200 p-2">Designer</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },
}
