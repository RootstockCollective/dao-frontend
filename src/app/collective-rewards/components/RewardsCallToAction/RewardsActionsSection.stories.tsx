import type { Meta, StoryObj } from '@storybook/nextjs'

import Big from '@/lib/big'

import { PositionSimulator } from '../PositionSimulator'
import { RewardsCallToActionContent } from './RewardsCallToActionContent'

const meta: Meta = {
  title: 'Collective Rewards/RewardsActions',
  parameters: {
    layout: 'padded',
    // The cards navigate with `useRouter`, which needs Storybook's app-router mock.
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          'The position simulator alongside the two calls to action. The simulator is a what-if: ' +
          'it never reads the connected wallet, so its presets mean the same thing to every visitor.',
      },
    },
  },
}

export default meta

type Story = StoryObj

/** The section as it appears on the page. */
export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
      <PositionSimulator abiPct={5} rifPrice={0.0801} />
      <RewardsCallToActionContent
        backersUpcoming={Big(8459)}
        buildersUpcoming={Big(4689)}
        backersCount={292}
        buildersCount={16}
      />
    </div>
  ),
}

/** The simulator on its own, to check the preset states. */
export const Simulator: Story = {
  render: () => (
    <div className="max-w-[460px]">
      <PositionSimulator abiPct={5} rifPrice={0.0801} />
    </div>
  ),
}

/** Without participant counts the copy drops the number rather than showing a zero. */
export const WithoutCounts: Story = {
  render: () => (
    <div className="max-w-[560px]">
      <RewardsCallToActionContent backersUpcoming={Big(8459)} buildersUpcoming={Big(4689)} />
    </div>
  ),
}
