import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FilterRadioItem } from './FilterRadioItem'

const meta: Meta<typeof FilterRadioItem> = {
  title: 'Proposals/FilterRadioItem',
  component: FilterRadioItem,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterRadioItem>

export const Default: Story = {
  args: {
    id: 1,
    name: 'Default item',
    selected: false,
    onClick: (id: number) => {
      // eslint-disable-next-line no-console
      console.log('Clicked id:', id)
    },
  },
}

export const Selected: Story = {
  args: {
    id: 2,
    name: 'Selected item',
    selected: true,
    onClick: (id: number) => {
      // eslint-disable-next-line no-console
      console.log('Clicked id:', id)
    },
  },
}

export const Interactive: Story = {
  render: args => {
    const [selected, setSelected] = useState(false)
    return <FilterRadioItem {...args} selected={selected} onClick={() => setSelected(s => !s)} />
  },
  args: {
    id: 3,
    name: 'Interactive item',
  },
}
