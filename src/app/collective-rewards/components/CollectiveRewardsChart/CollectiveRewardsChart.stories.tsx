import { Meta, StoryObj } from '@storybook/nextjs'
import { BackingPoint, CycleWindow, RewardsPoint } from '@/app/collective-rewards/types'
import { CollectiveRewardsDualAxisChart } from './CollectiveRewardsChart'
import { WeiPerEther } from '@/lib/constants'
import { ONE_DAY_IN_MS } from '@/app/collective-rewards/constants/chartConstants'

// Mock data constants
const MOCK_DATA_CONSTANTS = {
  // Backing amounts
  BACKING_START: 350_000_000,
  BACKING_END: 780_000_000,
  BACKING_WOBBLE_AMPLITUDE: 2_000_000,
  BACKING_MIN_INCREMENT: 50_000,

  // Simple backing data
  SIMPLE_BACKING_BASE: 400_000_000,
  SIMPLE_BACKING_DAILY_GROWTH: 1_000_000,
  SIMPLE_BACKING_WOBBLE: 5_000_000,

  // Growing backing data
  GROWING_BACKING_START: 200_000_000,
  GROWING_BACKING_DAILY_RATE: 0.0005, // 0.05% daily growth
  GROWING_BACKING_WOBBLE: 10_000_000,

  // Rewards USD amounts
  REWARDS_C21_BASE: 80_000,
  REWARDS_C22_BASE: 120_000,
  REWARDS_C23_BASE: 180_000,
  REWARDS_MIN_USD: 120_000,
  REWARDS_WOBBLE_AMPLITUDE: 10_000,
  REWARDS_SIMPLE_BASE: 150_000,
  REWARDS_SIMPLE_DAILY_GROWTH: 500,
  REWARDS_SIMPLE_WOBBLE: 10_000,

  // Time and oscillation parameters
  WOBBLE_FREQUENCY_BACKING: 28,
  WOBBLE_FREQUENCY_REWARDS: 20,
  WOBBLE_FREQUENCY_SIMPLE_BACKING: 10,
  WOBBLE_FREQUENCY_SIMPLE_REWARDS: 15,
  WOBBLE_FREQUENCY_GROWING: 30,
  WOBBLE_FREQUENCY_GROWING_REWARDS: 20,

  // Reward calculation multipliers
  REWARDS_BACKING_MULTIPLIER: 0.0003,
  REWARDS_GROWING_WOBBLE: 20_000,
} as const

// Mock data generation function
function generateMockData() {
  const start = new Date('2024-03-01').getTime()
  const days = 490

  const cycles: CycleWindow[] = [
    {
      label: 'cycle 21',
      start: new Date('2024-03-01'),
      end: new Date('2025-01-15'),
      cycleDuration: Math.floor((new Date('2025-01-15').getTime() - new Date('2024-03-01').getTime()) / 1000),
      cycleNumber: 21,
    },
    {
      label: 'cycle 22',
      start: new Date('2025-01-15'),
      end: new Date('2025-06-15'),
      cycleDuration: Math.floor((new Date('2025-06-15').getTime() - new Date('2025-01-15').getTime()) / 1000),
      cycleNumber: 22,
    },
    {
      label: 'cycle 23',
      start: new Date('2025-06-15'),
      end: new Date('2025-07-31'),
      cycleDuration: Math.floor((new Date('2025-07-31').getTime() - new Date('2025-06-15').getTime()) / 1000),
      cycleNumber: 23,
    },
  ]

  const backingStart = MOCK_DATA_CONSTANTS.BACKING_START
  const backingEnd = MOCK_DATA_CONSTANTS.BACKING_END

  const backingSeries: BackingPoint[] = []
  let prevBacking: number = backingStart

  for (let i = 0; i < days; i++) {
    const day = new Date(start + i * ONE_DAY_IN_MS)
    const t = i / (days - 1) // 0..1

    // ease-in-out-ish curve + tiny wobble
    const curve = backingStart + (backingEnd - backingStart) * (0.5 - 0.5 * Math.cos(Math.PI * t))
    const wobble =
      Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_BACKING) *
      MOCK_DATA_CONSTANTS.BACKING_WOBBLE_AMPLITUDE

    const candidate = Math.round(curve + wobble)

    // ensure strictly non-decreasing
    const backing = Math.max(candidate, prevBacking + MOCK_DATA_CONSTANTS.BACKING_MIN_INCREMENT)
    prevBacking = backing

    backingSeries.push({ day, backing: BigInt(backing), backingWei: BigInt(backing) * WeiPerEther })
  }

  const rewardsSeries: RewardsPoint[] = backingSeries.map(({ day, backing }, i) => {
    const ts = (day as Date).getTime()
    const inC21 = ts < new Date('2025-01-15').getTime()
    const inC22 = ts >= new Date('2025-01-15').getTime() && ts < new Date('2025-06-15').getTime()

    const base = inC21
      ? MOCK_DATA_CONSTANTS.REWARDS_C21_BASE
      : inC22
        ? MOCK_DATA_CONSTANTS.REWARDS_C22_BASE
        : MOCK_DATA_CONSTANTS.REWARDS_C23_BASE

    const drift = inC21 ? i * 120 : inC22 ? (i - 320) * 220 : (i - 450) * 240
    const wobble =
      Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_REWARDS) *
      MOCK_DATA_CONSTANTS.REWARDS_WOBBLE_AMPLITUDE
    let usd = Math.max(MOCK_DATA_CONSTANTS.REWARDS_MIN_USD, Math.round(base + drift * 0.25 + wobble))

    const backingNum = Number(backing)
    const cap = Math.floor(backingNum * 0.00055)
    usd = Math.min(usd, cap)

    return { day, rewards: { rif: 0, rbtc: 0, usd } }
  })

  return { backingSeries, rewardsSeries, cycles }
}

const meta: Meta<typeof CollectiveRewardsDualAxisChart> = {
  title: 'Collective Rewards/DualAxisChart',
  component: CollectiveRewardsDualAxisChart,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
}

export default meta

type Story = StoryObj<typeof CollectiveRewardsDualAxisChart>

export const Default: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Dual Axis Chart with Mock Data</h1>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const Compact: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const WithDescription: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Collective Rewards Analytics</h1>
            <p className="text-gray-300 text-lg mb-2">
              This chart displays the relationship between backing amounts and rewards over multiple cycles.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>
                • <span className="text-v3-rif-blue">Blue area</span>: Total backing amount (left axis)
              </p>
              <p>
                • <span className="text-brand-rootstock-lime">Lime area</span>: Rewards distributed in USD
                (right axis)
              </p>
              <p>• Shaded regions represent different reward cycles</p>
              <p>• Data spans approximately 490 days across 3 cycles</p>
            </div>
          </div>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const SingleCycle: Story = {
  render: () => {
    const start = new Date('2024-06-01').getTime()
    const days = 90

    const cycles: CycleWindow[] = [
      {
        label: 'cycle 24',
        start: new Date('2024-06-01'),
        end: new Date('2024-08-30'),
        cycleDuration: Math.floor(
          (new Date('2024-08-30').getTime() - new Date('2024-06-01').getTime()) / 1000,
        ),
        cycleNumber: 24,
      },
    ]

    const backingSeries: BackingPoint[] = []
    for (let i = 0; i < days; i++) {
      const day = new Date(start + i * ONE_DAY_IN_MS)
      const backing = Math.round(
        MOCK_DATA_CONSTANTS.SIMPLE_BACKING_BASE +
          i * MOCK_DATA_CONSTANTS.SIMPLE_BACKING_DAILY_GROWTH +
          Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_SIMPLE_BACKING) *
            MOCK_DATA_CONSTANTS.SIMPLE_BACKING_WOBBLE,
      )
      backingSeries.push({ day, backing: BigInt(backing), backingWei: BigInt(backing) * WeiPerEther })
    }

    const rewardsSeries: RewardsPoint[] = backingSeries.map(({ day }, i) => ({
      day,
      rewards: {
        rif: 0,
        rbtc: 0,
        usd:
          MOCK_DATA_CONSTANTS.REWARDS_SIMPLE_BASE +
          i * MOCK_DATA_CONSTANTS.REWARDS_SIMPLE_DAILY_GROWTH +
          Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_SIMPLE_REWARDS) *
            MOCK_DATA_CONSTANTS.REWARDS_SIMPLE_WOBBLE,
      },
    }))

    return (
      <div className="bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Single Cycle View</h2>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const ManyCycles: Story = {
  render: () => {
    const start = new Date('2023-01-01').getTime()
    const days = 730 // 2 years

    const cycles: CycleWindow[] = [
      {
        label: 'cycle 18',
        start: new Date('2023-01-01'),
        end: new Date('2023-04-01'),
        cycleDuration: Math.floor(
          (new Date('2023-04-01').getTime() - new Date('2023-01-01').getTime()) / 1000,
        ),
        cycleNumber: 18,
      },
      {
        label: 'cycle 19',
        start: new Date('2023-04-01'),
        end: new Date('2023-07-01'),
        cycleDuration: Math.floor(
          (new Date('2023-07-01').getTime() - new Date('2023-04-01').getTime()) / 1000,
        ),
        cycleNumber: 19,
      },
      {
        label: 'cycle 20',
        start: new Date('2023-07-01'),
        end: new Date('2023-10-01'),
        cycleDuration: Math.floor(
          (new Date('2023-10-01').getTime() - new Date('2023-07-01').getTime()) / 1000,
        ),
        cycleNumber: 20,
      },
      {
        label: 'cycle 21',
        start: new Date('2023-10-01'),
        end: new Date('2024-01-01'),
        cycleDuration: Math.floor(
          (new Date('2024-01-01').getTime() - new Date('2023-10-01').getTime()) / 1000,
        ),
        cycleNumber: 21,
      },
      {
        label: 'cycle 22',
        start: new Date('2024-01-01'),
        end: new Date('2024-04-01'),
        cycleDuration: Math.floor(
          (new Date('2024-04-01').getTime() - new Date('2024-01-01').getTime()) / 1000,
        ),
        cycleNumber: 22,
      },
      {
        label: 'cycle 23',
        start: new Date('2024-04-01'),
        end: new Date('2024-07-01'),
        cycleDuration: Math.floor(
          (new Date('2024-07-01').getTime() - new Date('2024-04-01').getTime()) / 1000,
        ),
        cycleNumber: 23,
      },
      {
        label: 'cycle 24',
        start: new Date('2024-07-01'),
        end: new Date('2024-10-01'),
        cycleDuration: Math.floor(
          (new Date('2024-10-01').getTime() - new Date('2024-07-01').getTime()) / 1000,
        ),
        cycleNumber: 24,
      },
      {
        label: 'cycle 25',
        start: new Date('2024-10-01'),
        end: new Date('2024-12-31'),
        cycleDuration: Math.floor(
          (new Date('2024-12-31').getTime() - new Date('2024-10-01').getTime()) / 1000,
        ),
        cycleNumber: 25,
      },
    ]

    const backingSeries: BackingPoint[] = []
    let prevBacking: number = MOCK_DATA_CONSTANTS.GROWING_BACKING_START

    for (let i = 0; i < days; i++) {
      const day = new Date(start + i * ONE_DAY_IN_MS)
      const growth = prevBacking * MOCK_DATA_CONSTANTS.GROWING_BACKING_DAILY_RATE // 0.05% daily growth
      const backing = Math.round(
        prevBacking +
          growth +
          Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_GROWING) *
            MOCK_DATA_CONSTANTS.GROWING_BACKING_WOBBLE,
      )
      prevBacking = backing
      backingSeries.push({ day, backing: BigInt(backing), backingWei: BigInt(backing) * WeiPerEther })
    }

    const rewardsSeries: RewardsPoint[] = backingSeries.map(({ day, backing }, i) => ({
      day,
      rewards: {
        rif: 0,
        rbtc: 0,
        usd:
          Math.floor(Number(backing) * MOCK_DATA_CONSTANTS.REWARDS_BACKING_MULTIPLIER) +
          Math.sin(i / MOCK_DATA_CONSTANTS.WOBBLE_FREQUENCY_GROWING_REWARDS) *
            MOCK_DATA_CONSTANTS.REWARDS_GROWING_WOBBLE,
      },
    }))

    return (
      <div className="bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Many Cycles (2 Years)</h2>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const CustomColors: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Custom Color Scheme</h2>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: '#FF6B6B',
                rewards: '#4ECDC4',
              }}
              yLeftLabel="STAKED"
              yRightLabel="EARNED"
              height={420}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const SmallHeight: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Compact Height (250px)</h2>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <CollectiveRewardsDualAxisChart
              backingSeries={backingSeries}
              rewardsSeries={rewardsSeries}
              cycles={cycles}
              colors={{
                backing: 'var(--brand-rif-blue)',
                rewards: 'var(--brand-rootstock-lime)',
              }}
              yLeftLabel="BACKING"
              yRightLabel="REWARDS"
              height={250}
            />
          </div>
        </div>
      </div>
    )
  },
}
