import type { Meta, StoryObj } from '@storybook/react'
import AllocationBar from './AllocationBar'
import { AllocationItem } from './types'

const meta = {
  title: 'Components/AllocationBar',
  component: AllocationBar,
} satisfies Meta<typeof AllocationBar>

export default meta

type Story = StoryObj<typeof meta>

const addUnallocated = (items: AllocationItem[]): AllocationItem[] => {
  const allocatedSum = items.reduce((sum, { value }) => sum + value, 0)
  if (allocatedSum >= 100) {
    return items
  }
  return [
    ...items,
    {
      key: 'uncallocated',
      label: 'available funds',
      value: 100 - allocatedSum,
      color: 'bg-[#25211E]',
      displayColor: '#25211E',
    },
  ]
}

const defaultItems: AllocationItem[] = [
  {
    key: 'boltz',
    label: 'Boltz',
    value: 20,
    color: 'bg-purple-400',
    displayColor: '#a78bfa', // Tailwind purple-400 hex
  },
  {
    key: 'wallet',
    label: '0x1D11...2D00',
    value: 10,
    color: 'bg-cyan-300',
    displayColor: '#67e8f9', // Tailwind cyan-300 hex
  },
  {
    key: 'abuilder',
    label: 'another builder',
    value: 10,
    color: 'bg-yellow-300',
    displayColor: '#DEFF1A', // Tailwind cyan-300 hex
  },
]
const defaultItemsWithUnallocated = addUnallocated(defaultItems)

export const Default: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
  },
}

export const WithoutPercent: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
    showPercent: false,
  },
}

export const WithoutLegend: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
    showLegend: false,
  },
}

export const WithoutLegendAndPercent: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
    showPercent: false,
    showLegend: false,
  },
}

const dataWithTemp: AllocationItem[] = [
  ...defaultItems,
  {
    key: 'money-on-chain',
    label: 'MoneyOnChain',
    value: 35,
    color: 'bg-green-400', // #4ade80
    displayColor: '#4ade80', // Tailwind green-400 hex
    isTemporary: true,
  },
]
export const WithoutTemporaryValues: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    showPercent: true,
    showLegend: true,
  },
}
