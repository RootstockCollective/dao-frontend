import type { Meta, StoryObj } from '@storybook/react'
import { BackersPercentageCell } from './BackersPercentageCell'
import { parseEther } from 'viem'

type StoryArgs = {
  currentPercentage: number
  nextPercentage: number
  className: string
}

const meta: Meta<StoryArgs> = {
  title: 'Builders/Table/BackersPercentageCell',
  component: BackersPercentageCell,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    currentPercentage: {
      control: 'number',
      description: 'Current backers percentage value (0-100)',
      defaultValue: 15,
    },
    nextPercentage: {
      control: 'number',
      description: 'Next backers percentage value (0-100)',
      defaultValue: 18,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  render: args => {
    const { currentPercentage, nextPercentage, className } = args
    const percentage = {
      current: parseEther((currentPercentage / 100).toString()),
      next: parseEther((nextPercentage / 100).toString()),
      cooldownEndTime: BigInt(0),
    }
    return <BackersPercentageCell percentage={percentage} className={className} />
  },
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    currentPercentage: 15,
    nextPercentage: 18,
    className: '',
  },
}

export const WithIncrease: Story = {
  args: {
    currentPercentage: 10,
    nextPercentage: 25,
  },
}

export const WithDecrease: Story = {
  args: {
    currentPercentage: 30,
    nextPercentage: 20,
  },
}

export const NoChange: Story = {
  args: {
    currentPercentage: 15,
    nextPercentage: 15,
  },
}
