import React from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

const builders = [
  { name: 'Builder 1', change: '+12.5%', amount: '123,456' },
  { name: 'Builder 2', change: '+8.7%', amount: '98,765' },
  { name: 'Builder 3', change: '+5.2%', amount: '45,678' },
]

export const Table = () => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm">
              <th className="pb-4">Builder</th>
              <th className="pb-4">Change</th>
              <th className="pb-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {builders.map((builder, index) => (
              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-4">
                  <span className="text-white">{builder.name}</span>
                </td>
                <td className="py-4">
                  <span className="text-green-500">{builder.change}</span>
                </td>
                <td className="py-4">
                  <span className="text-white">{builder.amount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded">
          Show next 20 Builders
        </button>
      </div>
    </div>
  )
}

// FIXME: Connect table to real builder data API
// FIXME: Implement sorting functionality for columns
// FIXME: Implement pagination for large datasets
// FIXME: Add real actions menu functionality
