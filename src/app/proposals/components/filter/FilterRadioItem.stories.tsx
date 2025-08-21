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
    option: { label: 'Default item', value: 'default-item' },
    selected: false,
    onClick: (option: string) => {
      // eslint-disable-next-line no-console
      console.log('Clicked id:', option)
    },
  },
}

export const Selected: Story = {
  args: {
    option: { label: 'Selected item', value: 'selected-item' },
    selected: true,
    onClick: (id: string) => {
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
    option: { label: 'Interactive item', value: 'interactive-item' },
  },
}
