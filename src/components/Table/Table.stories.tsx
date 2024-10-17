import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { tableSampleData } from './tableSampleData'

const meta = {
  title: 'Components/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta

type Story = StoryObj<typeof meta>

// complex data for display in the table
export const Default: Story = {
  args: {
    data: tableSampleData,
    equalColumns: true,
  },
}
// Simple sample table data
const simpleData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

// The simple data example for display in the table
export const SimpleTable: Story = {
  args: {
    data: simpleData,
  },
}
