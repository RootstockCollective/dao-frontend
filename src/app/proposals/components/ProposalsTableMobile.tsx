import { Expandable, ExpandableContent, ExpandableHeader } from '@/components/Expandable'
import { flexRender, Row, type Table as ReactTable } from '@tanstack/react-table'
import { Proposal } from '../shared/types'
import { useState } from 'react'
import { Span } from '@/components/Typography'

// Proposals table component for mobile
export const ProposalsTableMobile = ({ table }: { table: ReactTable<Proposal> }) => {
  return table.getRowModel().rows.map(row => <ExpandableRow key={row.id} row={row} />)
}

// Each row is an expandable component
const ExpandableRow = ({ row }: { row: Row<Proposal> }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <Expandable onToggleExpanded={setIsExpanded} className="pb-5 mb-5 border-b border-bg-60">
      <ExpandableHeader triggerColor="var(--color-bg-0)">{renderCell(row, 'name')}</ExpandableHeader>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          {renderCell(row, 'proposer')}
          <Divider />
          <div>{isExpanded ? renderCell(row, 'propType') : renderCell(row, 'timeRemaining')}</div>
        </div>
        {renderCell(row, 'status')}
      </div>
      <ExpandableContent>
        <div className="flex flex-row">
          <div className="flex flex-2 flex-col gap-2">
            <div>
              <Span variant="body-xs" className="text-text-40">
                Date
              </Span>
              {renderCell(row, 'date')}
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                Quorum - needed | reached
              </Span>
              {renderCell(row, 'quorum')}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div>
              <Span variant="body-xs" className="text-text-40">
                Vote ending in
              </Span>
              {renderCell(row, 'timeRemaining')}
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                Votes
              </Span>
              <div className="flex justify-start">{renderCell(row, 'votes')}</div>
            </div>
          </div>
        </div>
      </ExpandableContent>
    </Expandable>
  )
}

// Utility function to render the cell for the given column
const renderCell = (row: Row<Proposal>, columnId: string) => {
  const cell = row.getVisibleCells().find(cell => cell.column.columnDef.id === columnId)
  if (cell) {
    return flexRender(cell.column.columnDef.cell, cell.getContext())
  }
  return null
}

// Custom divider component
const Divider = () => <div className="w-0.5 h-1.5 rounded-full bg-v3-text-40" />
