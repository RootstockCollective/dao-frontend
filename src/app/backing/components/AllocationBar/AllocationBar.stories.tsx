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
      displayColor: '#25211E',
    },
  ]
}

const defaultItems: AllocationItem[] = [
  {
    key: 'boltz',
    label: 'Boltz',
    value: 20,
    displayColor: '#9E76FF',
  },
  {
    key: 'wallet',
    label: '0x1D11...2D00',
    value: 10,
    displayColor: '#08FFD0',
  },
  {
    key: 'abuilder',
    label: 'another builder',
    value: 10,
    displayColor: '#DEFF1A',
  },
]
const defaultItemsWithUnallocated = addUnallocated(defaultItems)

export const Default: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
    valueDisplay: {
      showPercent: true,
      format: {
        percentDecimals: 0,
      },
    },
  },
}

export const WithPercentDecimals: Story = {
  args: {
    initialItemsData: addUnallocated([
      {
        key: 'boltz',
        label: 'Boltz',
        value: 20.3,
        displayColor: '#9E76FF',
      },
      {
        key: 'wallet',
        label: '0x1D11...2D00',
        value: 10,
        displayColor: '#08FFD0',
      },
      {
        key: 'abuilder',
        label: 'another builder',
        value: 10.76,
        displayColor: '#DEFF1A',
      },
    ]),
    valueDisplay: {
      showPercent: true,
      format: {
        percentDecimals: 2,
      },
    },
  },
}

export const WithValues: Story = {
  args: {
    initialItemsData: addUnallocated([
      {
        key: 'boltz',
        label: 'Boltz',
        value: 20.3,
        displayColor: '#9E76FF',
      },
      {
        key: 'wallet',
        label: '0x1D11...2D00',
        value: 10,
        displayColor: '#08FFD0',
      },
      {
        key: 'abuilder',
        label: 'another builder',
        value: 10.76,
        displayColor: '#DEFF1A',
      },
    ]),
    valueDisplay: {
      showValue: true,
    },
  },
}

export const WithValuesAndPercent: Story = {
  args: {
    initialItemsData: addUnallocated([
      {
        key: 'boltz',
        label: 'Boltz',
        value: 20.3,
        displayColor: '#9E76FF',
      },
      {
        key: 'wallet',
        label: '0x1D11...2D00',
        value: 10,
        displayColor: '#08FFD0',
      },
      {
        key: 'abuilder',
        label: 'another builder',
        value: 10.76,
        displayColor: '#DEFF1A',
      },
    ]),
    valueDisplay: {
      showValue: true,
      showPercent: true,
    },
  },
}

export const WithoutPercent: Story = {
  args: {
    initialItemsData: defaultItemsWithUnallocated,
    valueDisplay: {
      showPercent: false,
    },
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
    valueDisplay: {
      showPercent: false,
    },
    showLegend: false,
  },
}

const dataWithTemp: AllocationItem[] = [
  ...defaultItems,
  {
    key: 'money-on-chain',
    label: 'MoneyOnChain',
    value: 35,
    displayColor: '#4ade80',
    isTemporary: true,
  },
]

export const WithTemporaryValues: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
  },
}

export const NotDraggable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isDraggable: false,
  },
}

export const NotResizable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isResizable: false,
  },
}

export const NotEditable: Story = {
  args: {
    initialItemsData: addUnallocated(dataWithTemp),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isResizable: false,
    isDraggable: false,
  },
}

export const WithoutUnallocatedValuesAndFixedHeight: Story = {
  args: {
    initialItemsData: addUnallocated([]),
    height: '1rem',
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isDraggable: false,
    isResizable: false,
  },
}
