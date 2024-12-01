import { useMemo, memo, useState } from 'react'
import {
  createColumnHelper,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type LatestProposalResponse } from './hooks/useFetchLatestProposals'
import { type EventArgumentsParameter, getEventArguments } from '@/app/proposals/shared/utils'
import { StatusColumn } from '@/app/proposals/StatusColumn'
import { Table } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
import { SentimentColumn } from '@/app/proposals/SentimentColumn'
import { ProposalNameColumn } from '@/app/proposals/ProposalNameColumn'
import { VotesColumn } from './VotesColumn'
import { DebounceSearch } from '../../components/DebounceSearch/DebounceSearch'
import { useVotesColumn } from './hooks/useVotesColumn'
import { useTimeRemainingColumn } from './hooks/useTimeRemainingColumn'
import { useProposalStates } from './hooks/useProposalStates'

interface LatestProposalsTableProps {
  proposals: LatestProposalResponse[]
}

const LatestProposalsTable = ({ proposals }: LatestProposalsTableProps) => {
  const [searchedProposal, setSearchedProposal] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  // Table columns data
  const votesColumn = useVotesColumn({ proposals })
  const timeData = useTimeRemainingColumn({ proposals })
  const states = useProposalStates({ proposals })

  // join all table columns data into one object before passing to the Table
  const proposalData = useMemo(() => {
    if (proposals?.length === 0) return []
    const proposalsWithEventArgs = proposals
      ?.map(proposal => getEventArguments(proposal as unknown as EventArgumentsParameter))
      .map((proposal, i) => ({
        ...proposal,
        ...votesColumn[i],
        ...timeData[i],
        ...states[i],
      }))

    const searchResultsProposals = proposalsWithEventArgs?.filter(({ name }) => {
      try {
        const proposalName = String(name).toLowerCase()
        return proposalName.includes(searchedProposal.toLowerCase())
      } catch (e) {
        return false
      }
    })

    return searchResultsProposals ?? []
  }, [proposals, searchedProposal, timeData, votesColumn, states])

  const onSearchSubmit = (searchValue: string) => {
    setSearchedProposal(searchValue)
  }

  // Table columns definition
  const { accessor } = createColumnHelper<(typeof proposalData)[number]>()
  const columns = [
    accessor('name', {
      id: 'name',
      header: 'Proposal',
      cell: info => (
        <ProposalNameColumn name={info.row.original.name} proposalId={info.row.original.proposalId} />
      ),
    }),
    accessor('votes.percentageToShow', {
      id: 'votes',
      header: 'Quorum Votes',
      cell: info => <VotesColumn column={info.row.original.votes} />,
    }),
    accessor(row => row.Starts.unix(), {
      id: 'date',
      header: 'Date',
      cell: info => <Typography tagVariant="p">{info.row.original.Starts.format('MM-DD-YYYY')}</Typography>,
    }),
    accessor('time.timeRemainingSec', {
      id: 'timeRemaining',
      header: 'Time Remaining',
      cell: info => (
        <Typography tagVariant="p" className={info.row.original.time.colorClass}>
          {info.row.original.time.timeRemainingMsg}
        </Typography>
      ),
    }),
    accessor(row => row.votes, {
      id: 'sentiment',
      header: 'Sentiment',
      cell: info => (
        <SentimentColumn
          index={info.row.index}
          againstVotes={info.row.original.votes?.againstVotes}
          forVotes={info.row.original.votes?.forVotes}
          abstainVotes={info.row.original.votes?.abstainVotes}
        />
      ),
      sortingFn: (rowA, rowB) => {
        const getDominantVoteType = (votesData: typeof rowA.original.votes) => {
          const { againstVotes, forVotes, abstainVotes } = votesData
          const maxCount = Math.max(againstVotes, forVotes, abstainVotes)
          if (maxCount === forVotes) return { type: 'for', count: maxCount, priority: 1 }
          if (maxCount === againstVotes) return { type: 'against', count: maxCount, priority: 2 }
          else return { type: 'abstain', count: maxCount, priority: 3 }
        }
        const dominantA = getDominantVoteType(rowA.original.votes)
        const dominantB = getDominantVoteType(rowB.original.votes)
        if (dominantA.type === dominantB.type) {
          return dominantB.count - dominantA.count
        }
        return dominantA.priority - dominantB.priority
      },
    }),
    accessor('proposalState', {
      id: 'status',
      header: 'Status',
      cell: info => <StatusColumn proposalState={info.row.original.proposalState} />,
    }),
  ]
  const table = useReactTable({
    columns,
    data: proposalData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <HeaderTitle className="mb-4">Latest Proposals</HeaderTitle>
      <DebounceSearch placeholder="Search a proposal" onSearchSubmit={onSearchSubmit} />
      {proposalData.length > 0 ? (
        <Table
          table={table}
          data-testid="TableProposals"
          tbodyProps={{
            'data-testid': 'TableProposalsTbody',
          }}
          className="overflow-visible"
        />
      ) : (
        <Typography tagVariant="p" data-testid="NoProposals">
          No proposals found &#x1F622;
        </Typography>
      )}
    </div>
  )
}

export const LatestProposalsTableMemoized = memo(LatestProposalsTable)
