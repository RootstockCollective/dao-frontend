import type { Meta, StoryObj } from '@storybook/nextjs'
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
    label: 'Default item',
    selected: false,
    onClick: (option: string) => {
      console.log('Clicked id:', option)
    },
  },
}

export const Selected: Story = {
  args: {
    label: 'Selected item',
    selected: true,
    onClick: (id: string) => {
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
    label: 'Interactive item',
  },
}
