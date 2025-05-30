import type { Meta, StoryObj } from '@storybook/react'
import { Spotlight } from './Spotlight'

const meta = {
  title: 'Koto/Backing/Components/Spotlight',
  component: Spotlight,
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
} satisfies Meta<typeof Spotlight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-6xl">
        <Story />
      </div>
    ),
  ],
}

export const WithDifferentBuilders: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-6xl">
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-6 text-white">IN THE SPOTLIGHT</h3>
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: 'CryptoKing', rewards: '75%', amount: '1,250.00 USD' },
              { name: 'BlockMaster', rewards: '60%', amount: '850.00 USD' },
              { name: 'DeFiGuru', rewards: '45%', amount: '650.00 USD' },
              { name: 'Web3Pro', rewards: '80%', amount: '1,500.00 USD' },
            ].map((builder, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
                <h4 className="text-orange-400 font-semibold text-lg mb-2">{builder.name}</h4>
                <div className="text-gray-400 text-sm mb-1">Rewards: {builder.rewards}</div>
                <div className="text-white font-semibold mb-4">{builder.amount}</div>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                  Back Builder
                </button>
              </div>
            ))}
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
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-6xl">
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-6 text-white">IN THE SPOTLIGHT</h3>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="text-center">
                <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-600 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-600 rounded mb-1 animate-pulse"></div>
                <div className="h-5 bg-gray-600 rounded mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}

export const TwoColumns: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-4xl">
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-6 text-white">FEATURED BUILDERS</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { name: 'TopBuilder', rewards: '90%', amount: '2,000.00 USD' },
              { name: 'RisingStar', rewards: '65%', amount: '950.00 USD' },
            ].map((builder, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
                <h4 className="text-orange-400 font-semibold text-xl mb-2">{builder.name}</h4>
                <div className="text-gray-400 text-sm mb-1">Rewards: {builder.rewards}</div>
                <div className="text-white font-semibold mb-4">{builder.amount}</div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-sm font-medium">
                  Back Builder
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}