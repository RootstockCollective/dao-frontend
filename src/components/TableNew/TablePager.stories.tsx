import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Range, TablePager, TablePagerProps } from './TablePager'

const meta: Meta<typeof TablePager> = {
  title: 'components/TableNew/TablePager',
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

const TablePagerWithState = ({ pageSize, totalItems, pagedItemName, mode }: TablePagerProps) => {
  const [pageInfoPerEvent, setPageInfoPerEvent] = useState<Range[]>([])

  useEffect(() => {
    setPageInfoPerEvent([{ start: 0, end: pageSize }])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <TablePager
        pageSize={pageSize}
        totalItems={totalItems}
        pagedItemName={pagedItemName}
        mode={mode}
        onPageChange={range => {
          setPageInfoPerEvent(prev => [...prev, range])
        }}
      />
      {pageInfoPerEvent && (
        <div className="mt-4 p-4 bg-v3-bg-accent-0 rounded-md font-mono">
          {pageInfoPerEvent.map((range, index) => {
            if (index === 0) {
              return (
                <div key={index}>
                  <strong>On page mount:</strong> showing items {range.start} to {range.end}
                </div>
              )
            } else {
              return (
                <div key={index}>
                  <strong>Page Change Event {index}:</strong> showing items {range.start} to {range.end}
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: args => <TablePagerWithState {...args} />,
  args: {
    pageSize: 20,
    totalItems: 42,
    pagedItemName: 'items',
    mode: 'expandable',
  },
}
