import { Meta, StoryObj } from '@storybook/nextjs'
import { BackingPoint, CycleWindow, RewardsPoint } from '@/app/collective-rewards/types'
import { DualAxisChart } from './DualAxisChart'

// Mock data generation function
function generateMockData() {
  const start = new Date('2024-03-01').getTime()
  const days = 490

  const cycles: CycleWindow[] = [
    {
      label: 'cycle 21',
      start: '2024-03-01',
      end: '2025-01-15',
    },
    {
      label: 'cycle 22',
      start: '2025-01-15',
      end: '2025-06-15',
    },
    {
      label: 'cycle 23',
      start: '2025-06-15',
      end: '2025-07-31',
    },
  ]

  const backingStart = 350_000_000
  const backingEnd = 780_000_000

  const backingSeries: BackingPoint[] = []
  let prevBacking = backingStart

  for (let i = 0; i < days; i++) {
    const day = new Date(start + i * 24 * 3600 * 1000)
    const t = i / (days - 1) // 0..1

    // ease-in-out-ish curve + tiny wobble
    const curve = backingStart + (backingEnd - backingStart) * (0.5 - 0.5 * Math.cos(Math.PI * t))
    const wobble = Math.sin(i / 28) * 2_000_000

    const candidate = Math.round(curve + wobble)

    // ensure strictly non-decreasing
    const backing = Math.max(candidate, prevBacking + 50_000)
    prevBacking = backing

    backingSeries.push({ day, backing })
  }

  const rewardsSeries: RewardsPoint[] = backingSeries.map(({ day, backing }, i) => {
    const ts = (day as Date).getTime()
    const inC21 = ts < new Date('2025-01-15').getTime()
    const inC22 = ts >= new Date('2025-01-15').getTime() && ts < new Date('2025-06-15').getTime()

    const base = inC21 ? 80_000 : inC22 ? 120_000 : 180_000

    const drift = inC21 ? i * 120 : inC22 ? (i - 320) * 220 : (i - 450) * 240
    const wobble = Math.sin(i / 20) * 10_000
    let usd = Math.max(120_000, Math.round(base + drift * 0.25 + wobble))

    const backingNum = Number(backing)
    const cap = Math.floor(backingNum * 0.00055)
    usd = Math.min(usd, cap)

    return { day, rewards: { rif: 0, rbtc: 0, usd } }
  })

  return { backingSeries, rewardsSeries, cycles }
}

const meta: Meta<typeof DualAxisChart> = {
  title: 'Collective Rewards/DualAxisChart',
  component: DualAxisChart,
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

type Story = StoryObj<typeof DualAxisChart>

export const Default: Story = {
  render: () => {
    const { backingSeries, rewardsSeries, cycles } = generateMockData()

    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Dual Axis Chart with Mock Data</h1>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <DualAxisChart
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
            <DualAxisChart
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
                • <span className="text-blue-400">Blue area</span>: Total backing amount (left axis)
              </p>
              <p>
                • <span className="text-green-400">Green area</span>: Rewards distributed in USD (right axis)
              </p>
              <p>• Shaded regions represent different reward cycles</p>
              <p>• Data spans approximately 490 days across 3 cycles</p>
            </div>
          </div>
          <div className="p-6 pt-10 text-white rounded-2xl">
            <DualAxisChart
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
