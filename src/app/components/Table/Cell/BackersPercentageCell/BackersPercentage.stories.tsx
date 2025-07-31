import type { Meta, StoryObj } from '@storybook/react'
import { parseEther } from 'viem'
import { BackersPercentageCell } from './BackersPercentageCell'

type StoryArgs = {
  previousPercentage: number
  currentPercentage: number
  nextPercentage: number
  className: string
}

const meta: Meta<StoryArgs> = {
  title: 'Koto/Builders/Table/Cell/BackersPercentageCell',
  component: BackersPercentageCell,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    previousPercentage: {
      control: 'number',
      description: 'Previous backers percentage value (0-100)',
      defaultValue: 15,
    },
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
    const { previousPercentage, currentPercentage, nextPercentage, className } = args
    const percentage = {
      previous: parseEther((previousPercentage / 100).toString()),
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
    previousPercentage: 15,
    currentPercentage: 15,
    nextPercentage: 18,
    className: '',
  },
}

export const WithIncrease: Story = {
  args: {
    previousPercentage: 10,
    currentPercentage: 10,
    nextPercentage: 25,
  },
}

export const WithDecrease: Story = {
  args: {
    previousPercentage: 30,
    currentPercentage: 30,
    nextPercentage: 20,
  },
}

export const NoChange: Story = {
  args: {
    previousPercentage: 15,
    currentPercentage: 15,
    nextPercentage: 15,
  },
}
