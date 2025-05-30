import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'

const meta = {
  title: 'Koto/Backing/Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1f2937' },
        { name: 'light', value: '#ffffff' }
      ]
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-7xl">
        <Story />
      </div>
    ),
  ],
}

export const WithLimitedData: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-7xl">
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Builder</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Change</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Alpha', rewards: 85, change: 15, amount: '1,200.00 USD', positive: true },
                  { name: 'Beta', rewards: 70, change: -5, amount: '850.00 USD', positive: false },
                  { name: 'Gamma', rewards: 60, change: 8, amount: '600.00 USD', positive: true },
                ].map((builder, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full"></div>
                        </div>
                        <span className="text-orange-400">{builder.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{builder.rewards}</td>
                    <td className="py-3 px-2">
                      <span className={builder.positive ? 'text-green-400' : 'text-red-400'}>
                        {builder.positive ? '+' : ''}{builder.change}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{builder.amount}</td>
                    <td className="py-3 px-2 text-right">
                      <button className="text-gray-400 hover:text-white">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
  ],
}

export const LoadingState: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-7xl">
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Builder</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Change</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="border-b border-gray-700/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="h-4 w-8 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="h-4 w-10 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="h-4 w-4 bg-gray-600 rounded animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
  ],
}

export const EmptyState: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-7xl">
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Builder</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Change</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rewards</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl">📭</div>
                      <div>No builders found</div>
                      <div className="text-sm">Be the first to join!</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
  ],
}

export const MobileView: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-4 rounded-sm w-full max-w-sm">
        <div className="w-full">
          <div className="space-y-4">
            {[
              { name: 'Beefy', rewards: 50, change: 10, amount: '300.00 USD', positive: true },
              { name: 'Good', rewards: 50, change: 10, amount: '300.00 USD', positive: true },
              { name: 'Boltz', rewards: 51, change: -11, amount: '300.00 USD', positive: false },
            ].map((builder, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <span className="text-orange-400 font-medium">{builder.name}</span>
                  </div>
                  <button className="text-gray-400 hover:text-white">⋯</button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Rewards</div>
                    <div className="text-white">{builder.rewards}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Change</div>
                    <div className={builder.positive ? 'text-green-400' : 'text-red-400'}>
                      {builder.positive ? '+' : ''}{builder.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Amount</div>
                    <div className="text-white">{builder.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}