import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { tableSampleData, columnRenderingFuncs } from './tableSampleData'
import { ReactNode } from 'react'

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
    renderers: columnRenderingFuncs,
    isSortable: true,
    sortingOptions: {
      // don't sort `stake` column
      stake: false,
    },
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
    isSortable: true,
    data: simpleData,
  },
}

// Alphabet ordered data
const alphabetData = [
  { A: 'y', B: 'в', C: 16, P: 0.1 },
  { A: 'a', B: 'ц', C: 3, P: 2.0 },
  { A: 'n', B: 'н', C: 0, P: 100 },
  { A: 'w', B: 'т', C: 266, P: 30 },
]

export const AlphabetTable: Story = {
  args: {
    data: alphabetData,
    // enable sorting for the whole table
    isSortable: true,
    sortingOptions: {
      // disable sorting in B column
      B: false,
    },
    renderers: {
      // each cell in the `P` column is rendered as a paragraph with styling
      P: val => (
        <p style={{ fontWeight: 800, fontStyle: 'italic', textDecoration: 'underline' }}>
          $ {val as ReactNode}
        </p>
      ),
    },
  },
}
