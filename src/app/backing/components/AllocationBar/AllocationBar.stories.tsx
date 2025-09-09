import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { zeroAddress } from 'viem'
import AllocationBar from './AllocationBar'
import { AllocationChangeData, AllocationItem } from './types'

const meta = {
  title: 'KOTO/Backing/Components/AllocationBar',
  component: AllocationBar,
} satisfies Meta<typeof AllocationBar>

export default meta

type Story = StoryObj<typeof meta>

const addUnallocated = (items: AllocationItem[], totalAllocated: bigint): AllocationItem[] => {
  const allocatedSum = items.reduce((sum, { value }) => sum + value, 0n)
  return [
    ...items,
    {
      key: zeroAddress,
      label: 'available funds',
      value: totalAllocated - allocatedSum,
      displayColor: '#25211E',
    },
  ]
}

const defaultItems: AllocationItem[] = [
  {
    key: '0xB0bB0000000000000000000000000000000000b0',
    label: 'Boltz',
    value: 20n,
    displayColor: '#9E76FF',
  },
  {
    key: '0x1D11000000000000000000000000000000002D00',
    label: '0x1D11...2D00',
    value: 10n,
    displayColor: '#08FFD0',
  },
  {
    key: '0xABu1100000000000000000000000000000000b1d',
    label: 'another builder',
    value: 10n,
    displayColor: '#DEFF1A',
  },
]

const defaultItemsWithUnallocated = addUnallocated(defaultItems, 100n)

export const Default: Story = {
  args: {
    itemsData: defaultItemsWithUnallocated,
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
    itemsData: addUnallocated(
      [
        {
          key: '0xB0bB0000000000000000000000000000000000b0',
          label: 'Boltz',
          value: 20n,
          displayColor: '#9E76FF',
        },
        {
          key: '0x1D11000000000000000000000000000000002D00',
          label: '0x1D11...2D00',
          value: 10n,
          displayColor: '#08FFD0',
        },
        {
          key: '0xABu1100000000000000000000000000000000b1d',
          label: 'another builder',
          value: 11n,
          displayColor: '#DEFF1A',
        },
      ],
      100n,
    ),
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
    itemsData: addUnallocated(
      [
        {
          key: '0xB0bB0000000000000000000000000000000000b0',
          label: 'Boltz',
          value: 20n,
          displayColor: '#9E76FF',
        },
        {
          key: '0x1D11000000000000000000000000000000002D00',
          label: '0x1D11...2D00',
          value: 10n,
          displayColor: '#08FFD0',
        },
        {
          key: '0xABu1100000000000000000000000000000000b1d',
          label: 'another builder',
          value: 11n,
          displayColor: '#DEFF1A',
        },
      ],
      100n,
    ),
    valueDisplay: {
      showValue: true,
    },
  },
}

export const WithValuesAndPercent: Story = {
  args: {
    itemsData: addUnallocated(
      [
        {
          key: '0xB0bB0000000000000000000000000000000000b0',
          label: 'Boltz',
          value: 20n,
          displayColor: '#9E76FF',
        },
        {
          key: '0x1D11000000000000000000000000000000002D00',
          label: '0x1D11...2D00',
          value: 10n,
          displayColor: '#08FFD0',
        },
        {
          key: '0xABu1100000000000000000000000000000000b1d',
          label: 'another builder',
          value: 11n,
          displayColor: '#DEFF1A',
        },
      ],
      100n,
    ),
    valueDisplay: {
      showValue: true,
      showPercent: true,
    },
  },
}

export const WithoutPercent: Story = {
  args: {
    itemsData: defaultItemsWithUnallocated,
    valueDisplay: {
      showPercent: false,
    },
  },
}

export const WithoutLegend: Story = {
  args: {
    itemsData: defaultItemsWithUnallocated,
    showLegend: false,
  },
}

export const WithoutLegendAndPercent: Story = {
  args: {
    itemsData: defaultItemsWithUnallocated,
    valueDisplay: {
      showPercent: false,
    },
    showLegend: false,
  },
}

const dataWithTemp: AllocationItem[] = [
  ...defaultItems,
  {
    key: '0xM0C0000000000000000000000000000000000c01',
    label: 'MoneyOnChain',
    value: 35n,
    displayColor: '#4ade80',
    isTemporary: true,
  },
]

export const WithTemporaryValues: Story = {
  args: {
    itemsData: addUnallocated(dataWithTemp, 100n),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
  },
}

export const NotDraggable: Story = {
  args: {
    itemsData: addUnallocated(dataWithTemp, 100n),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isDraggable: false,
  },
}

export const NotResizable: Story = {
  args: {
    itemsData: addUnallocated(dataWithTemp, 100n),
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isResizable: false,
  },
}

export const NotEditable: Story = {
  args: {
    itemsData: addUnallocated(dataWithTemp, 100n),
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
    itemsData: addUnallocated([], 100n),
    height: '1rem',
    valueDisplay: {
      showPercent: true,
    },
    showLegend: true,
    isDraggable: false,
    isResizable: false,
  },
}

const InteractiveAllocationBar = (args: any) => {
  const [itemsData, setItemsData] = useState<AllocationItem[]>(args.itemsData)

  const handleChange = (change: AllocationChangeData) => {
    const { type, itemsData, values } = change
    if (type === 'resize') {
      const newItems = itemsData.map((item, index) => {
        return { ...item, value: values[index] }
      })
      setItemsData(newItems)
    } else if (change.type === 'reorder') {
      setItemsData(itemsData)
    }
  }

  return <AllocationBar {...args} itemsData={itemsData} onChange={handleChange} />
}

export const Controlled: Story = {
  render: args => <InteractiveAllocationBar {...args} />,
  args: {
    itemsData: defaultItemsWithUnallocated,
    valueDisplay: {
      showPercent: true,
    },
  },
}
