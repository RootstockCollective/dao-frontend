import type { Meta } from '@storybook/react'
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { GridTable } from './GridTable'
import { Badge } from '../Badge'
import { Paragraph } from '../TypographyNew'

const meta: Meta = {
  title: 'Components/Table/GridTable',
  component: GridTable,
  parameters: {
    layout: 'padded',
  },
}

export default meta

// Sample data for complex table with JSX elements
interface ComplexRowData {
  id: number
  project: string
  status: 'active' | 'completed' | 'pending'
  progress: number
  team: string[]
  budget: number
}

/* Table data */
const complexData: ComplexRowData[] = [
  {
    id: 1,
    project: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit, dolorem.',
    status: 'active',
    progress: 75,
    team: ['Alice', 'Bob'],
    budget: 50000,
  },
  {
    id: 2,
    project: 'Consectetur adipisicing elit. Eveniet voluptates, nostrum tenetur quidem maxime nisi.',
    status: 'completed',
    progress: 100,
    team: ['Carol', 'David', 'Eve'],
    budget: 80000,
  },
  {
    id: 3,
    project:
      'Velit tenetur optio itaque deserunt quos quo praesentium fugiat obcaecati harum. Dolore. Lorem ipsum dolor sit amet, consectetur adipisicing.',
    status: 'pending',
    progress: 25,
    team: ['Frank'],
    budget: 120000,
  },
]
/* Table structure */
const columnHelper = createColumnHelper<ComplexRowData>()
const columns = [
  columnHelper.accessor('project', {
    header: context => <p className="grow w-full text-orange-300 text-center">Project</p>,
    cell: context => <Paragraph className="text-inherit">{context.getValue()}</Paragraph>,
    meta: {
      width: '2fr',
    },
  }),
  columnHelper.accessor('progress', {
    header: context => <p className="text-green-300 tracking-widest">Progress</p>,
    cell: context => <Paragraph className="font-medium text-center">{context.getValue()}</Paragraph>,
    meta: {
      width: '150px',
    },
  }),
  columnHelper.accessor('status', {
    header: 'Role',
    cell: context => <Badge content={context.getValue()} className="bg-bg-60 text-text-100 px-2 py-1" />,
  }),
]
/* Ready table object */
const useTable = () =>
  useReactTable({
    data: complexData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

export const Basic = {
  render: () => {
    const table = useTable()
    return <GridTable table={table} className="" />
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic table with simple text data and sorting capabilities.',
      },
    },
  },
}

export const StackedFirstColumn = {
  render: () => {
    const table = useTable()
    return <GridTable table={table} stackFirstColumn className="" />
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with the first column stacked (expanded to full width) for better mobile layouts.',
      },
    },
  },
}
