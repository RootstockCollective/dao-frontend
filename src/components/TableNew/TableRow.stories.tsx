import type { Meta, StoryObj } from '@storybook/react'
import { TableRow } from './TableRow'
import { TableCore } from '../Table/components/TableCore'
import { TableBody } from '../Table/components/TableBody'
import { TableHead } from '../Table/components/TableHead'
import { TableCell } from '../Table/components/TableCell'
import { TableContextProvider } from './context/TableContext'
import { Span } from '@/components/Typography'

const meta: Meta<typeof TableRow> = {
  title: 'Components/TableRow',
  component: TableRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <TableContextProvider>
        <div className="relative">
          <TableCore>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid #2D2D2D',
                    fontFamily: 'rootstock-sans',
                  }}
                >
                  Column 1
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid #2D2D2D',
                    fontFamily: 'rootstock-sans',
                  }}
                >
                  Column 2
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid #2D2D2D',
                    fontFamily: 'rootstock-sans',
                  }}
                >
                  Column 3
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Story />
            </TableBody>
          </TableCore>
        </div>
      </TableContextProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TableRow>

export const Default: Story = {
  args: {
    children: (
      <>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            Cell 1
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            Cell 2
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            Cell 3
          </Span>
        </TableCell>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Basic TableRow with consistent typography using text-[14px] and Span component with light variant, matching existing Table component patterns.',
      },
    },
  },
}

export const Selectable: Story = {
  args: {
    rowId: 'row-1',
    selectable: true,
    children: (
      <>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            Selectable Row
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            Click me
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-[14px]" variant="light">
            I highlight on hover
          </Span>
        </TableCell>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Selectable TableRow with hover effects and selection state. Uses subtle white/opacity colors for selection that match the table design system.',
      },
    },
  },
}
