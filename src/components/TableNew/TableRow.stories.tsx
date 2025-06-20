import type { Meta, StoryObj } from '@storybook/react'
import { TableRow } from './TableRow'
import { TableCore } from '../Table/components/TableCore'
import { TableBody } from '../Table/components/TableBody'
import { TableHead } from '../Table/components/TableHead'
import { TableCell } from '../Table/components/TableCell'
import { withTableContext } from '@/shared/context/TableContext'
import { Span } from '@/components/Typography'

const meta: Meta<typeof TableRow> = {
  title: 'Koto/Components/TableNew/TableRow',
  component: TableRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => {
      const WrappedStory = withTableContext(() => (
        <div className="relative">
          <TableCore>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid var(--color-v3-bg-accent-80)',
                    fontFamily: 'rootstock-sans',
                  }}
                >
                  Column 1
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid var(--color-v3-bg-accent-80)',
                    fontFamily: 'rootstock-sans',
                  }}
                >
                  Column 2
                </TableCell>
                <TableCell
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    borderBottom: '1px solid var(--color-v3-bg-accent-80)',
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
      ))
      return <WrappedStory />
    },
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
          'Selectable TableRow with hover effects and selection state. Now supports multi-row selection using the shared TableContext.',
      },
    },
  },
}

export const MultipleRows: Story = {
  render: () => {
    const MultiRowStory = withTableContext(() => (
      <div className="relative">
        <TableCore>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  borderBottom: '1px solid var(--color-v3-bg-accent-80)',
                  fontFamily: 'rootstock-sans',
                }}
              >
                Name
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  borderBottom: '1px solid var(--color-v3-bg-accent-80)',
                  fontFamily: 'rootstock-sans',
                }}
              >
                Data
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  borderBottom: '1px solid var(--color-v3-bg-accent-80)',
                  fontFamily: 'rootstock-sans',
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow rowId="row-1" selectable>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Row 1
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Data 1
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Action 1
                </Span>
              </TableCell>
            </TableRow>
            <TableRow rowId="row-2" selectable>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Row 2
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Data 2
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Action 2
                </Span>
              </TableCell>
            </TableRow>
            <TableRow rowId="row-3" selectable>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Row 3
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Data 3
                </Span>
              </TableCell>
              <TableCell>
                <Span className="text-[14px]" variant="light">
                  Action 3
                </Span>
              </TableCell>
            </TableRow>
          </TableBody>
        </TableCore>
      </div>
    ))
    return <MultiRowStory />
  },
  parameters: {
    docs: {
      description: {
        story: `
Complete example showing TableRow multi-selection functionality with the shared TableContext:

**Features:**
- Multi-row selection support
- Click rows to select/deselect multiple rows
- Uses shared TableContext for consistent state management
- Hover effects with Tailwind classes
- Tooltip guidance for better UX

**Design Consistency:**
- Headers use rootstock-sans font, 16px, bold
- Rows use text-[14px] class with Span component and "light" variant
- Selection states use subtle styling
        `,
      },
    },
  },
}
