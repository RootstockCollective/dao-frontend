import type { Meta, StoryObj } from '@storybook/react'
import { TableRow } from './TableRow'
import { TableCore } from '../Table/components/TableCore'
import { TableBody } from '../Table/components/TableBody'
import { TableHead } from '../Table/components/TableHead'
import { TableCell } from '../Table/components/TableCell'
import { withTableContext } from '@/shared/context/TableContext'
import { Span } from '@/components/Typography'

const meta: Meta<typeof TableRow> = {
  title: 'Components/TableNew/TableRow',
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
              <TableRow rowId="header-row">
                <TableCell className="font-bold text-base border-b border-[var(--color-v3-bg-accent-80)] font-[rootstock-sans]">
                  Column 1
                </TableCell>
                <TableCell className="font-bold text-base border-b border-[var(--color-v3-bg-accent-80)] font-[rootstock-sans]">
                  Column 2
                </TableCell>
                <TableCell className="font-bold text-base border-b border-[var(--color-v3-bg-accent-80)] font-[rootstock-sans]">
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
    rowId: 'default-row',
    children: (
      <>
        <TableCell>
          <Span className="text-sm" variant="light">
            Cell 1
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-sm" variant="light">
            Cell 2
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-sm" variant="light">
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
          'Basic TableRow with consistent typography using text-sm and Span component with light variant, matching existing Table component patterns.',
      },
    },
  },
}

export const Selectable: Story = {
  args: {
    rowId: 'row-1',
    children: (
      <>
        <TableCell>
          <Span className="text-sm" variant="light">
            Selectable Row
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-sm" variant="light">
            Click me
          </Span>
        </TableCell>
        <TableCell>
          <Span className="text-sm" variant="light">
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
      <>
        <TableRow rowId="row-1">
          <TableCell>
            <Span className="text-sm" variant="light">
              Row 1
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Data 1
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Action 1
            </Span>
          </TableCell>
        </TableRow>
        <TableRow rowId="row-2">
          <TableCell>
            <Span className="text-sm" variant="light">
              Row 2
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Data 2
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Action 2
            </Span>
          </TableCell>
        </TableRow>
        <TableRow rowId="row-3">
          <TableCell>
            <Span className="text-sm" variant="light">
              Row 3
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Data 3
            </Span>
          </TableCell>
          <TableCell>
            <Span className="text-sm" variant="light">
              Action 3
            </Span>
          </TableCell>
        </TableRow>
      </>
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
- Rows use text-sm class with Span component and "light" variant
- Selection states use subtle styling
        `,
      },
    },
  },
}
