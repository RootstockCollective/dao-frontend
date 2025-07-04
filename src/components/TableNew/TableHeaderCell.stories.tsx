import type { Meta, StoryObj } from '@storybook/react'
import { AxeIcon, PiIcon } from 'lucide-react'
import { useState } from 'react'
import { TableHeaderCell, TableHeaderNode } from '.'
import { Header } from '../TypographyNew'

const meta: Meta<typeof TableHeaderCell> = {
  title: 'Components/TableNew/TableHeaderCell',
  component: TableHeaderCell,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof TableHeaderCell>

export const Default: Story = {
  render: () => {
    const [clicks, setClicks] = useState(0)

    const handleClick = () => {
      setClicks(prev => prev + 1)
      console.log('clicked')
    }

    return (
      <div className="flex flex-col gap-4 w-[300px] bg-red-200 text-green-800">
        <TableHeaderCell
          onClick={handleClick}
          data-testid="table-header-cell"
          className="outline outline-amber-400 cursor-pointer hover:bg-amber-100 transition-color"
        >
          <TableHeaderNode>
            <Header variant="h1">Some title</Header>
            <Header variant="h2">And a subtitle</Header>
          </TableHeaderNode>
        </TableHeaderCell>
        {clicks > 0 && (
          <div className="text-sm text-black font-medium">✓ Header cell was clicked {clicks} times!</div>
        )}
      </div>
    )
  },
}

export const NotClickable: Story = {
  render: () => {
    return (
      <TableHeaderCell className="outline outline-amber-400">
        <TableHeaderNode>
          <Header variant="h1">Some title</Header>
          <Header variant="h2">And a subtitle</Header>
        </TableHeaderNode>
      </TableHeaderCell>
    )
  },
}

export const ClickableWithIcon: Story = {
  render: () => {
    const [isClicked, setIsClicked] = useState(false)

    const handleClick = () => {
      setIsClicked(prev => !prev)
    }

    return (
      <>
        <TableHeaderCell onClick={handleClick} className="outline outline-amber-400 w-[300px]">
          {isClicked ? <PiIcon /> : <AxeIcon />}
          <TableHeaderNode>
            <Header variant="h1">Some title</Header>
            <Header variant="h2">And a subtitle</Header>
          </TableHeaderNode>
        </TableHeaderCell>
      </>
    )
  },
}

export const UsedInTable: Story = {
  render: () => {
    const [tableData, setTableData] = useState<{ id: string; header: string; data: string }[]>([
      {
        id: 'header-1',
        header: 'Header 1',
        data: 'Data 1',
      },
      {
        id: 'header-2',
        header: 'Header 2',
        data: 'Data 2',
      },
    ])

    const handleClickForUseInTable = () => {
      const idx = tableData.length + 1
      setTableData(prev => [
        ...prev,
        {
          id: 'header-' + idx,
          header: 'Header ' + idx,
          data: 'Data ' + idx,
        },
      ])
    }

    return (
      <table className="bg-red-200 text-green-800">
        <thead className="bg-blue-200">
          <tr>
            {tableData.map((item, index) => (
              <th key={index} className="bg-blue-200">
                <TableHeaderCell onClick={() => handleClickForUseInTable()}>
                  <PiIcon />
                  <TableHeaderNode>
                    <Header variant="h1">{item.header}</Header>
                    {index % 2 === 0 && <Header variant="h2">And a subtitle</Header>}
                  </TableHeaderNode>
                </TableHeaderCell>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {tableData.map((item, index) => (
              <td key={index}>{item.data}</td>
            ))}
          </tr>
        </tbody>
      </table>
    )
  },
}
