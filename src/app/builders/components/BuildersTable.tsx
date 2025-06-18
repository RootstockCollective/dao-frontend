'use client'

import { Builder } from '@/app/collective-rewards/types'
import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { Column, useTableActionsContext, useTableContext, withTableContext } from '@/shared/context'
import { CheckCheckIcon, CheckIcon, ShieldBan, TimerIcon } from 'lucide-react'
import { FC, HtmlHTMLAttributes, useEffect, useState } from 'react'
import { Address } from 'viem'

const PAGE_SIZE = 3

const TableCell: FC<HtmlHTMLAttributes<HTMLTableCellElement>> = ({ children, className, onClick }) => {
  return (
    <td className={cn('p-3 border-b outline outline-dotted outline-amber-50', className)} onClick={onClick}>
      {children}
    </td>
  )
}

// FIXME: temporary cells, will be replaced with actual cells
const SelectorCell: FC<{
  isSelected: boolean
  className?: string
}> = ({ isSelected, className }) => {
  return <TableCell className={className}>{isSelected ? <CheckCheckIcon /> : <CheckIcon />}</TableCell>
}

const BuilderCell: FC<{
  children: React.ReactNode
  onClick: () => void
  className?: string
}> = ({ children, onClick, className }) => {
  return (
    <TableCell className={className}>
      <div className={`w-2 h-2 rounded-full`} onClick={onClick} />
      {children}
    </TableCell>
  )
}

const BackingCell: FC<{
  className?: string
}> = ({ className }) => {
  return <TableCell className={className}>Backing</TableCell>
}

const ChangeCell: FC<{
  className?: string
}> = ({ className }) => {
  return <TableCell className={className}>Change</TableCell>
}

const RewardsCell: FC<{
  className?: string
}> = ({ className }) => {
  return <TableCell className={className}>Rewards</TableCell>
}

const AllocationsCell: FC<{
  className?: string
}> = ({ className }) => {
  return <TableCell className={className}>Allocations</TableCell>
}

const ActionsCell: FC<{
  className?: string
}> = ({ className }) => {
  return <TableCell className={className}>Actions</TableCell>
}

const withFilter = (Component: FC<{ className?: string }>) => {
  return ({ className }: { className?: string }) => {
    return <Component className={className} />
  }
}

const SelectorHeaderCell: FC<CommonComponentProps & { hasSelections: boolean }> = ({
  className,
  hasSelections,
}) => {
  return <TableCell className={className}>{hasSelections ? <CheckCheckIcon /> : <CheckIcon />}</TableCell>
}

// ------------------------------------------------------------
type ColumnType = 'selector' | 'builder' | 'backing' | 'change' | 'rewards' | 'allocations' | 'actions'

const DEFAULT_HEADERS: Column[] = [
  {
    id: 'selector',
    type: 'selector',
    hidden: false,
    sortable: false,
  },
  {
    id: 'builder',
    type: 'builder',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backing',
    type: 'backing',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_percentage',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'change',
    type: 'change',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards-per-cycle',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards-upcoming',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'allocations',
    type: 'allocations',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    type: 'actions',
    hidden: true,
    sortable: false,
  },
]

export const Table = () => {
  const [pageStart, setPageStart] = useState(0)
  const [pageEnd, setPageEnd] = useState(10)

  const { columns, selectedRows } = useTableContext()
  const dispatch = useTableActionsContext()
  const {
    data: builderCount,
    isLoading: isLoadingBuilderCount,
    error: errorBuilderCount,
  } = useGetBuilderCount()
  const {
    data: builders,
    isLoading: isLoadingBuilders,
    error: errorBuilders,
  } = useGetBuilders(pageStart, pageEnd)

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
  }, [])

  useEffect(() => {
    setPageEnd(pageStart + PAGE_SIZE)
  }, [pageStart])

  useEffect(() => {
    if (builders) {
      dispatch({
        type: 'SET_ROWS',
        payload: Object.entries(builders).map(([address, builder]) => ({
          id: address,
          ...builder,
        })),
      })
    }
  }, [builders])
  return (
    <>
      <TableFilter />
      <table>
        <thead>
          <tr className="capitalize text-xs leading-4 bg-foreground">
            <SelectorHeaderCell hasSelections={Boolean(selectedRows?.length)} />
            {!columns[1].hidden && <TableCell>Builder</TableCell>}
            {!columns[2].hidden && <TableCell>Backing</TableCell>}
            {!columns[3].hidden && <TableCell>Rewards</TableCell>}
            {!columns[4].hidden && <TableCell>Change</TableCell>}
            {!columns[5].hidden && <TableCell>Rewards per cycle</TableCell>}
            {!columns[6].hidden && <TableCell>Rewards upcoming</TableCell>}
            {!columns[7].hidden && <TableCell>Allocations</TableCell>}
            {/* {columns.map((column, i) => {
              if (i === 0) {
                return <SelectorHeaderCell hasSelections={Boolean(selectedRows?.length)} />
              }
              if (column.id === 'actions') {
                return <TableCell>{column.type} header</TableCell>
              }

              return <TableCell>{column.type} header</TableCell>
            })} */}
          </tr>
        </thead>
        <tbody>
          {builders &&
            Object.entries(builders).map(([address, builder]) => (
              <tr
                key={builder.address}
                className="hover:bg-foreground/10 cursor-pointer"
                onClick={() => {
                  dispatch({
                    type: 'TOGGLE_ROW_SELECTION',
                    payload: builder.address,
                  })
                }}
              >
                <SelectorCell isSelected={selectedRows[builder.address]} />
                {!columns[1].hidden && (
                  <BuilderCell
                    onClick={() => {
                      console.log('navigate to builder', builder.address)
                    }}
                  >
                    {builder.builderName}
                    {builder.stateFlags?.revoked && <ShieldBan />}
                    {builder.stateFlags &&
                      (!builder.stateFlags.activated || !builder.stateFlags.kycApproved) && <TimerIcon />}
                  </BuilderCell>
                )}
                {!columns[2].hidden && <BackingCell />}
                {!columns[3].hidden && <RewardsCell />}
                {!columns[4].hidden && <ChangeCell />}
                {!columns[5].hidden && <RewardsCell />}
                {!columns[6].hidden && <RewardsCell />}
                {!columns[7].hidden && <AllocationsCell />}
              </tr>
            ))}
        </tbody>
      </table>
      {/* <TableCore>
        <TableHead>
          
        </TableHead>
        <TableBody>
          {builders &&
            Object.entries(builders).map(([address, builder]) => <TableRow key={builder.address}></TableRow>)}
        </TableBody>
      </TableCore> */}
      <BuildersTablePager
        pageSize={pageEnd - pageStart}
        totalItems={builderCount || 0}
        onPageChange={setPageStart}
      />
    </>
  )
}

// Mock hooks that simulate useQuery behavior
const useGetBuilders = (from: number, to: number) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<Record<Address, Builder> | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!from && !to) return

    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        // Simulate pagination by slicing the data
        const buildersArray = Object.entries(mockBuilders)
        const paginatedBuilders = buildersArray.slice(from, from + PAGE_SIZE)
        const paginatedData = Object.fromEntries(paginatedBuilders) as Record<Address, Builder>

        setData(paginatedData)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }, 500) // 500ms delay to simulate API call

    return () => clearTimeout(timer)
  }, [from, to])

  return { data, isLoading, error }
}

const useGetBuilderCount = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<number | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        setData(Object.keys(mockBuilders).length)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }, 300) // 300ms delay to simulate API call

    return () => clearTimeout(timer)
  }, [])

  return { data, isLoading, error }
}

const TableFilter = () => {
  return <div>TableFilter</div>
}

export const BuildersTable = withTableContext(Table)

interface BuildersTablePagerProps {
  pageSize: number
  totalItems: number
  onPageChange: (startIndex: number, endIndex: number) => void
}

const BuildersTablePager: FC<BuildersTablePagerProps> = ({ pageSize, totalItems, onPageChange }) => {
  console.log('pageSize', pageSize)
  console.log('totalItems', totalItems)
  console.log('onPageChange', onPageChange)
  return (
    <>
      <div className="flex items-stretch">
        <Button onClick={() => onPageChange(pageSize - 10, pageSize)}>Previous</Button>
        <Button onClick={() => onPageChange(pageSize, pageSize + 10)}>Next</Button>
        <p>
          {pageSize} of {totalItems}
        </p>
      </div>
    </>
  )
}

const mockBuilders: Record<Address, Builder> = {
  '0x1234567890123456789012345678901234567890': {
    address: '0x1234567890123456789012345678901234567890',
    builderName: 'Builder 1',
    proposal: {
      id: 1n,
      name: 'Proposal 1',
      description: 'Description 1',
      date: '2021-01-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x1234567890123456789012345678901234567890',
    backerRewardPercentage: {
      previous: 10n,
      next: 15n,
      cooldown: 7n,
      active: 12n,
    },
  },
  '0x2345678901234567890123456789012345678901': {
    address: '0x2345678901234567890123456789012345678901',
    builderName: 'Builder 2',
    proposal: {
      id: 2n,
      name: 'Proposal 2',
      description: 'Description 2',
      date: '2021-02-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x2345678901234567890123456789012345678901',
    backerRewardPercentage: {
      previous: 8n,
      next: 12n,
      cooldown: 5n,
      active: 10n,
    },
  },
  '0x3456789012345678901234567890123456789012': {
    address: '0x3456789012345678901234567890123456789012',
    builderName: 'Builder 3',
    proposal: {
      id: 3n,
      name: 'Proposal 3',
      description: 'Description 3',
      date: '2021-03-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: false,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x3456789012345678901234567890123456789012',
    backerRewardPercentage: {
      previous: 12n,
      next: 18n,
      cooldown: 8n,
      active: 15n,
    },
  },
  '0x4567890123456789012345678901234567890123': {
    address: '0x4567890123456789012345678901234567890123',
    builderName: 'Builder 4',
    proposal: {
      id: 4n,
      name: 'Proposal 4',
      description: 'Description 4',
      date: '2021-04-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    gauge: '0x4567890123456789012345678901234567890123',
    backerRewardPercentage: {
      previous: 15n,
      next: 20n,
      cooldown: 10n,
      active: 18n,
    },
  },
  '0x5678901234567890123456789012345678901234': {
    address: '0x5678901234567890123456789012345678901234',
    builderName: 'Builder 5',
    proposal: {
      id: 5n,
      name: 'Proposal 5',
      description: 'Description 5',
      date: '2021-05-01',
    },
    stateFlags: {
      activated: false,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x5678901234567890123456789012345678901234',
    backerRewardPercentage: {
      previous: 9n,
      next: 14n,
      cooldown: 6n,
      active: 12n,
    },
  },
  '0x6789012345678901234567890123456789012345': {
    address: '0x6789012345678901234567890123456789012345',
    builderName: 'Builder 6',
    proposal: {
      id: 6n,
      name: 'Proposal 6',
      description: 'Description 6',
      date: '2021-06-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: true,
      revoked: false,
    },
    gauge: '0x6789012345678901234567890123456789012345',
    backerRewardPercentage: {
      previous: 11n,
      next: 16n,
      cooldown: 7n,
      active: 14n,
    },
  },
  '0x7890123456789012345678901234567890123456': {
    address: '0x7890123456789012345678901234567890123456',
    builderName: 'Builder 7',
    proposal: {
      id: 7n,
      name: 'Proposal 7',
      description: 'Description 7',
      date: '2021-07-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: true,
    },
    gauge: '0x7890123456789012345678901234567890123456',
    backerRewardPercentage: {
      previous: 13n,
      next: 19n,
      cooldown: 9n,
      active: 16n,
    },
  },
  '0x8901234567890123456789012345678901234567': {
    address: '0x8901234567890123456789012345678901234567',
    builderName: 'Builder 8',
    proposal: {
      id: 8n,
      name: 'Proposal 8',
      description: 'Description 8',
      date: '2021-08-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: false,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    gauge: '0x8901234567890123456789012345678901234567',
    backerRewardPercentage: {
      previous: 7n,
      next: 11n,
      cooldown: 4n,
      active: 9n,
    },
  },
}
