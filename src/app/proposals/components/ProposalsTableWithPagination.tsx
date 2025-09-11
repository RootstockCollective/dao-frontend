'use client'
import { Proposal } from '@/app/proposals/shared/types'
import { Countdown } from '@/components/Countdown'
import { Pagination } from '@/components/Pagination'
import { Status } from '@/components/Status'
import { GridTable } from '@/components/Table'
import { Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useSearchParams } from 'next/navigation'
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { Category } from '../components/category'
import { ProposalNameColumn, ProposerColumn } from './table-columns/ProposalNameColumn'
import { QuorumColumn, VotesColumn } from './table-columns/VotesColumn'

interface ProposalsTableWithPaginationProps {
  proposals: Proposal[]
  isFilterSidebarOpen: boolean
}

export interface ProposalsTableRef {
  resetPagination: () => void
}

const ProposalsTableWithPagination = forwardRef<ProposalsTableRef, ProposalsTableWithPaginationProps>(
  ({ proposals, isFilterSidebarOpen }, ref) => {
    const searchParams = useSearchParams()

    // React-table sorting state
    const [sorting, setSorting] = useState<SortingState>([])

    // Convert 1-indexed URL page to 0-indexed internal page
    const [pagination, setPagination] = useState<PaginationState>(() => ({
      pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
      pageSize: 10,
    }))

    const resetPagination = useCallback(() => setPagination(prev => ({ ...prev, pageIndex: 0 })), [])

    useImperativeHandle(ref, () => ({ resetPagination }), [resetPagination])

    // Table data definition helper
    const { accessor } = createColumnHelper<(typeof proposals)[number]>()

    // Table columns definition
    const columns = useMemo(
      () => [
        accessor('name', {
          id: 'name',
          cell: ({ cell, row }) => (
            <ProposalNameColumn name={cell.getValue()} proposalId={row.original.proposalId} />
          ),
        }),
        accessor('proposer', {
          id: 'proposer',
          header: 'Proposal name',
          sortDescFirst: false,
          cell: ({ cell }) => <ProposerColumn by={cell.getValue()} />,
          sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
          meta: {
            width: '1.6fr',
          },
        }),
        accessor('Starts', {
          id: 'date',
          header: 'Date',
          sortDescFirst: false,
          cell: ({ cell }) => <Paragraph>{cell.getValue().format('MMM DD, YYYY')}</Paragraph>,
          meta: {
            width: '1.2fr',
          },
        }),
        accessor('blocksUntilClosure', {
          id: 'timeRemaining',
          header: 'Vote ending in',
          sortDescFirst: false,
          cell: info => {
            const { proposalDeadline, blockNumber } = info.row.original
            return (
              <Countdown
                end={proposalDeadline}
                timeSource="blocks"
                referenceStart={Big(blockNumber)}
                colorDirection="normal"
              />
            )
          },
          sortingFn: (a, b) => {
            return a.original.blocksUntilClosure.cmp(b.original.blocksUntilClosure)
          },
          meta: {
            width: '1.32fr',
          },
        }),
        accessor('votes', {
          id: 'quorum',
          sortDescFirst: false,
          header: () => (
            <div>
              <div className="flex items-center-safe gap-1">
                <p className="mb-1">Quorum</p>
              </div>
              <Paragraph variant="body-xs" className="text-text-40">
                {isFilterSidebarOpen ? 'reached' : 'needed | reached'}
              </Paragraph>
            </div>
          ),
          cell: ({ row }) => {
            const quorum = row.original.quorumAtSnapshot
            const { forVotes, abstainVotes } = row.original.votes
            return (
              <QuorumColumn
                quorumVotes={forVotes.add(abstainVotes)}
                quorumAtSnapshot={quorum}
                hideQuorumTarget={isFilterSidebarOpen}
              />
            )
          },
          sortingFn: (a, b) => {
            const getQuorumPercent = (quorum: Big, quorumAtSnapshot: Big) =>
              quorumAtSnapshot.eq(0)
                ? Big(0)
                : quorum.div(quorumAtSnapshot).mul(100).round(undefined, Big.roundHalfEven)
            const percentA = getQuorumPercent(a.original.votes.quorum, a.original.quorumAtSnapshot)
            const percentB = getQuorumPercent(b.original.votes.quorum, b.original.quorumAtSnapshot)
            return percentA.cmp(percentB)
          },
          meta: {
            width: '1.4fr',
          },
        }),
        accessor('votes', {
          id: 'votes',
          header: 'Votes',
          sortDescFirst: false,
          cell: ({ cell }) => {
            const { forVotes, abstainVotes, againstVotes } = cell.getValue()
            return (
              <VotesColumn
                forVotes={forVotes.toNumber()}
                againstVotes={againstVotes.toNumber()}
                abstainVotes={abstainVotes.toNumber()}
              />
            )
          },
          sortingFn: (a, b) => {
            const votesA = a.original.votes
            const votesB = b.original.votes
            const sumA = votesA.forVotes.add(votesA.againstVotes).add(votesA.abstainVotes)
            const sumB = votesB.forVotes.add(votesB.againstVotes).add(votesB.abstainVotes)
            return sumA.cmp(sumB)
          },
          meta: {
            width: '1fr',
          },
        }),
        accessor('category', {
          id: 'propType',
          header: 'Type',
          sortDescFirst: false,
          meta: {
            width: '0.62fr',
          },
          cell: ({ cell }) => <Category category={cell.getValue()} />,
        }),
        accessor('proposalState', {
          id: 'status',
          header: 'Status',
          sortDescFirst: false,
          cell: ({ cell }) => (
            <div className="w-full flex justify-center">
              <Status proposalState={cell.getValue()} />
            </div>
          ),
          meta: {
            width: '0.8fr',
          },
        }),
      ],
      [accessor, isFilterSidebarOpen],
    )

    // create table data model which is passed to the Table UI component
    const table = useReactTable({
      columns,
      data: proposals,
      state: {
        sorting,
        pagination,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: setPagination,
      // Prevent pagination reset on data change
      autoResetPageIndex: false,
    })

    return (
      <>
        <GridTable
          className="min-w-[600px]"
          aria-label="Proposal table"
          stackFirstColumn
          table={table}
          data-testid="TableProposals"
        />
        <Pagination pagination={pagination} setPagination={setPagination} data={proposals} table={table} />
      </>
    )
  },
)

ProposalsTableWithPagination.displayName = 'ProposalsTableWithPagination'

export const ProposalsTable = memo(ProposalsTableWithPagination)
