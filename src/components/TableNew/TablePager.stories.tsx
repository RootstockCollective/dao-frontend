import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { TablePager } from './TablePager'

const meta: Meta<typeof TablePager> = {
  title: 'components/TableV3/TablePager',
  component: TablePager,
  argTypes: {
    pageSize: { control: { type: 'number', min: 1 } },
    totalItems: { control: { type: 'number', min: 0 } },
    pagedItemName: { control: 'text' },
    mode: { control: { type: 'radio' }, options: ['cyclic', 'expandable'] },
  },
}
export default meta

type Story = StoryObj<typeof TablePager>

export const Default: Story = {
  args: {
    pageSize: 20,
    totalItems: 42,
    pagedItemName: 'Builders',
    mode: 'cyclic',
    onPageChange: (startIndex, endIndex) => {
      console.log(`Page changed: showing items ${startIndex} to ${endIndex}`)
    },
  },
}

export const Empty: Story = {
  args: {
    pageSize: 20,
    totalItems: 0,
    pagedItemName: 'Builders',
    mode: 'cyclic',
    onPageChange: (startIndex, endIndex) => {
      console.log(`Page changed: showing items ${startIndex} to ${endIndex}`)
    },
  },
}
