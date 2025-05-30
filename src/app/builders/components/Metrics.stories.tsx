import type { Meta, StoryObj } from '@storybook/react'
import { Metrics } from './Metrics'

const meta = {
  title: 'Koto/Builders/Components/Metrics',
  component: Metrics,
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
} satisfies Meta<typeof Metrics>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
}

export const WithDifferentValues: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-4xl">
        <div className="grid grid-cols-3 gap-8 w-full">
          <div>
            <div className="text-gray-400 text-sm mb-2">Total Backing</div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">987,654,321</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-white">USDC</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-1">GLOBAL BUILDING USD</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Currently backed projects</div>
            <div className="text-3xl font-bold text-white">5,678</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Total active Builders</div>
            <div className="text-3xl font-bold text-white">789,012</div>
          </div>
        </div>
      </div>
    ),
  ],
}

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-6 rounded-sm w-full max-w-4xl">
        <div className="grid grid-cols-3 gap-8 w-full">
          <div>
            <div className="text-gray-400 text-sm mb-2">Total Builders</div>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-8 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="text-gray-400 text-xs mt-1">GLOBAL BUILDING USD</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Currently backed projects</div>
            <div className="w-20 h-8 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Total active Builders</div>
            <div className="w-24 h-8 bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    ),
  ],
}