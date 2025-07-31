import { withTableContext } from '@/shared/context'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SelectorHeaderCell } from './SelectorHeaderCell'

const meta: Meta<typeof SelectorHeaderCell> = {
  title: 'Koto/Builders/Table/Cell/SelectorHeaderCell',
  component: SelectorHeaderCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof SelectorHeaderCell>

export const Default: Story = {
  render: withTableContext(() => {
    const [hasSelections, setHasSelections] = useState(false)

    return (
      <div className="w-[300px] p-4 bg-[#37322F]">
        <SelectorHeaderCell
          onClick={() => setHasSelections(prev => !prev)}
          className="cursor-pointer hover:outline-1 hover:outline-white transition-colors p-2 rounded"
        />
        <div className="mt-4 text-sm text-white-600">
          Current state: {hasSelections ? 'Has selections' : 'No selections'}
        </div>
      </div>
    )
  }),
}

export const WithSelections: Story = {
  render: withTableContext(() => (
    <div className="w-[300px] p-4 bg-[#37322F]">
      <SelectorHeaderCell className="p-2" />
    </div>
  )),
}

export const WithoutSelections: Story = {
  render: withTableContext(() => (
    <div className="w-[300px] p-4 bg-[#37322F]">
      <SelectorHeaderCell className="p-2" />
    </div>
  )),
}

export const InTable: Story = {
  render: withTableContext(() => {
    const [selections, setSelections] = useState<string[]>([])

    return (
      <div className="w-[600px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#37322F]">
              <th className="border border-white-800 p-2">
                <SelectorHeaderCell
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
  }),
}
