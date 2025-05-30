import type { Meta, StoryObj } from '@storybook/react'
import { Content } from './Content'

const meta = {
  title: 'Koto/Builders/Components/Content',
  component: Content,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Content>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl">
        <Story />
      </div>
    ),
  ],
}

export const AlternativeContent: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl">
        <div className="bg-gradient-to-r from-blue-500 to-purple-400 rounded-lg p-8 text-white relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1/3 h-full">
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-80"></div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">JOIN THE REVOLUTION.</h2>
              <h3 className="text-xl text-blue-100 mb-4">BUILD THE FUTURE</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of builders creating the next generation of decentralized applications and earn rewards for your contributions.
              </p>
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
                  Start Building
                </button>
                <button className="border border-white/30 hover:bg-white/10 text-white px-6 py-2 rounded font-medium">
                  Learn More
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">WHY JOIN US?</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• Earn crypto rewards</li>
                <li>• Build cutting-edge tech</li>
                <li>• Join a global community</li>
                <li>• Shape the future of web3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
}

export const WithoutButtons: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl">
        <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-lg p-8 text-white relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1/3 h-full">
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-500 opacity-80"></div>
          </div>
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-4">COMING SOON</h2>
            <p className="text-orange-100 text-lg">
              Something amazing is being built. Stay tuned for updates.
            </p>
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
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-lg p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">BECOME A BUILDER.</h2>
            <h3 className="text-sm text-orange-100 mb-3">GET RICH AND FAMOUS</h3>
            <p className="text-orange-100 text-sm mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="flex flex-col space-y-2">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium text-sm">
                Become a Builder
              </button>
              <button className="border border-white/30 hover:bg-white/10 text-white px-4 py-2 rounded font-medium text-sm">
                Apply for a Grant
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
}