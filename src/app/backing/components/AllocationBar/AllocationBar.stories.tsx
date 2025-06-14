import type { Meta, StoryObj } from '@storybook/react'
import AllocationBar from './AllocationBar'
import { AllocationItem } from './types'

const meta = {
  title: 'KOTO/Backing/Components/AllocationBar',
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
    color: 'bg-[#9E76FF]',
    displayColor: '#9E76FF',
  },
  {
    key: 'wallet',
    label: '0x1D11...2D00',
    value: 10,
    color: 'bg-[#08FFD0]',
    displayColor: '#08FFD0',
  },
  {
    key: 'abuilder',
    label: 'another builder',
    value: 10,
    color: 'bg-yellow-300',
    displayColor: '#DEFF1A',
  },
]
const defaultItemsWithUnallocated = addUnallocated(defaultItems)

export const Default: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
  },
}

export const WithDecimals: Story = {
  args: {
    initialItemsData: addUnallocated([
      {
        key: 'boltz',
        label: 'Boltz',
        value: 20.3,
        color: 'bg-[#9E76FF]',
        displayColor: '#9E76FF',
      },
      {
        key: 'wallet',
        label: '0x1D11...2D00',
        value: 10,
        color: 'bg-[#08FFD0]',
        displayColor: '#08FFD0',
      },
      {
        key: 'abuilder',
        label: 'another builder',
        value: 10.76,
        color: 'bg-yellow-300',
        displayColor: '#DEFF1A',
      },
    ]),
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

export const WithTemporaryValues: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    showPercent: true,
    showLegend: true,
  },
}

export const NotDraggable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    showPercent: true,
    showLegend: true,
    isDraggable: false,
  },
}

export const NotResizable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    showPercent: true,
    showLegend: true,
    isResizable: false,
  },
}

export const NotEditable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    showPercent: true,
    showLegend: true,
    isResizable: false,
    isDraggable: false,
  },
}

export const WithoutUnallocatedValuesAndFixedHeight: Story = {
  args: {
    initialItemsData: addUnallocated([]),
    height: '1rem',
    showPercent: true,
    showLegend: true,
    isDraggable: false,
    isResizable: false,
  },
}
