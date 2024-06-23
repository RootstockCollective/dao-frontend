import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { tableSampleData } from './tableSampleData'
import tableDocs from './tableDocs.md'

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    docs: {
      description: {
        // docs in MD format
        component: tableDocs,
      },
    },
  },
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
