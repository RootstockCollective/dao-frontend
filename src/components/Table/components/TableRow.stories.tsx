import type { Meta, StoryObj } from '@storybook/react'
import { TableRow } from './TableRow'
import { TableCore } from './TableCore'
import { TableBody } from './TableBody'
import { TableHead } from './TableHead'
import { TableCell } from './TableCell'
import { TableContextProvider } from '../context'
import { TableActionsBar } from './TableActionsBar'
import { Button } from '../../Button'
import { Span } from '../../Typography'

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

export const WithMultipleRows: Story = {
  render: () => (
    <TableContextProvider>
      <div className="relative">
        <TableActionsBar
          position="top-right"
          singleRowActions={
            <>
              <Button variant="outlined">Edit</Button>
              <Button variant="outlined">Delete</Button>
            </>
          }
          multiRowActions={
            <>
              <Button variant="outlined">Bulk Edit</Button>
              <Button variant="outlined">Bulk Delete</Button>
            </>
          }
        />
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
                Name
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  borderBottom: '1px solid #2D2D2D',
                  fontFamily: 'rootstock-sans',
                }}
              >
                Data
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  borderBottom: '1px solid #2D2D2D',
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
    </TableContextProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: `
Complete example showing TableRow selection functionality with consistent design patterns:

**Typography & Design Consistency:**
- Headers use \`font-rootstock-sans\`, 16px, bold, with #2D2D2D border
- Rows use \`text-[14px]\` class with \`Span\` component and "light" variant
- Actions bar uses consistent padding, border, and typography patterns
- Selection states use subtle white/opacity colors matching table theme

**Behavior:**
- Click rows to select/deselect
- Single selection shows actions at bottom
- Multiple selections show actions at top-right
- Hover effects provide visual feedback
        `,
      },
    },
  },
}
