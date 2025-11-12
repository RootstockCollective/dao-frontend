'use client'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import { DecodedData, getDiscourseLinkFromProposalDescription } from '@/app/proposals/shared/utils'
import { Header, Paragraph } from '@/components/Typography'
import { useParams } from 'next/navigation'
import { usePricesContext } from '@/shared/context/PricesContext'
import { ParsedActionDetails, ProposalType } from './types'
import type { GetPricesResult } from '@/app/user/types'
import { RBTC, RIF, RIF_ADDRESS, USDRIF, USDRIF_ADDRESS, TRIF, ENV } from '@/lib/constants'
import {
  TechnicalDetails,
  ProposalProggressBar,
  Description,
  VotingDetails,
  ProposalDetails,
} from './components'
import { useVoteOnProposal } from '@/shared/hooks/useVoteOnProposal'
import { useProposalById } from '../context'
import { Category } from '../components/category'
import { Proposal } from '../shared/types'
import { useProposalAddressResolution } from './hooks/useProposalAddressResolution'
import { useMemo } from 'react'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useDiscourseYouTube } from '@/shared/hooks/useDiscourseYouTube'

export default function ProposalView() {
  const { id } = useParams<{ id: string }>() ?? {}
  const proposal = useProposalById(id)

  return <>{proposal && <PageWithProposal {...proposal} />}</>
}

// Utility to get token symbol from address (expandable)
const tokenAddressToSymbol = {
  [RIF_ADDRESS.toLowerCase()]: ENV === 'testnet' ? TRIF : RIF,
  [USDRIF_ADDRESS.toLowerCase()]: USDRIF,
  // Add more tokens here
}

const parseProposalActionDetails = (
  calldatasParsed: DecodedData[],
  prices: GetPricesResult,
): ParsedActionDetails => {
  const action = calldatasParsed?.[0]
  if (!action || action.type !== 'decoded') return { type: '-', amount: undefined, tokenSymbol: undefined }
  const { functionName, args } = action
  switch (functionName) {
    case 'withdraw': {
      const amount = transformToBigIntSafely(args[1])
      const toAddress = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.WITHDRAW,
        amount,
        tokenSymbol: RBTC,
        price: prices?.[RBTC]?.price ?? 0,
        toAddress,
      }
    }
    case 'withdrawERC20': {
      const tokenAddress = typeof args[0] === 'string' ? args[0].toLowerCase() : ''
      const amount = transformToBigIntSafely(args[2])
      const toAddress = typeof args[1] === 'string' ? args[1] : undefined
      const symbol = tokenAddressToSymbol[tokenAddress] || 'unknown symbol'
      const price = prices?.[symbol]?.price || 0

      return {
        type: ProposalType.WITHDRAW,
        amount,
        tokenSymbol: symbol,
        price,
        toAddress,
      }
    }
    case 'communityApproveBuilder': {
      const builder = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.BUILDER_ACTIVATION,
        builder,
      }
    }
    case 'removeWhitelistedBuilder':
    case 'communityBanBuilder': {
      const builder = typeof args[0] === 'string' ? args[0] : undefined
      return {
        type: ProposalType.BUILDER_DEACTIVATION,
        builder,
      }
    }
    default:
      return { type: '-', amount: undefined, tokenSymbol: undefined }
  }
}

const PageWithProposal = (proposal: Proposal) => {
  const {
    proposalId,
    name,
    description,
    proposer,
    Starts,
    calldatasParsed,
    proposalDeadline,
    voteStart,
    category,
  } = proposal
  const { prices } = usePricesContext()
  // Memoize parsedActionBase to ensure stable reference - only changes when dependencies change
  const parsedActionBase = useMemo(
    () => parseProposalActionDetails(calldatasParsed, prices),
    [calldatasParsed, prices],
  )
  const parsedAction = useProposalAddressResolution(parsedActionBase)
  const voteOnProposalData = useVoteOnProposal(proposalId)
  const snapshot = useGetProposalSnapshot(proposalId)
  const { data: youtubeUrl } = useDiscourseYouTube(getDiscourseLinkFromProposalDescription(description))

  const actionName = calldatasParsed?.[0]?.type === 'decoded' ? calldatasParsed[0].functionName : undefined

  return (
    <div className="min-h-screen flex flex-col gap-4 w-full max-w-full">
      <div className="md:flex items-center gap-4">
        <Header variant="h3" className="text-2xl lg:text-3xl !leading-[0.9]">
          {name}
        </Header>
        <div className="flex gap-2 items-end md:mt-0 mt-3">
          <Category className="mb-0.5" category={category} hasGradient />
          <Paragraph variant="body-l" className="text-bg-0 !leading-none whitespace-nowrap">
            {category}
          </Paragraph>
        </div>
      </div>
      <div className="flex md:flex-row flex-col gap-2 w-full max-w-full mt-6">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-bg-80 flex flex-col overflow-hidden">
            <ProposalProggressBar proposalState={voteOnProposalData.proposalState} />
            <ProposalDetails
              name={name}
              description={description}
              proposer={proposer}
              startsAt={Starts}
              parsedAction={parsedAction}
              actionName={actionName}
            />
            <Description description={description} />
            <VideoPlayer url={youtubeUrl} className="p-4 md:p-6" />
          </div>
          <TechnicalDetails proposalId={proposalId} snapshot={snapshot} />
        </div>
        <VotingDetails
          proposalId={proposalId}
          parsedAction={parsedAction}
          actionName={actionName}
          snapshot={snapshot}
          proposalDeadline={proposalDeadline}
          voteStart={voteStart}
          voteOnProposalData={voteOnProposalData}
        />
      </div>
    </div>
  )
}

/**
 *  Function created because previously we had a validation like typeof var === 'bigint'
 *  But the amount can also be string because it's coming from an API (BigInt cannot be serialized)
 *  @TODO re-visit and standardize
 *  @param amount
 */
function transformToBigIntSafely(amount: unknown): bigint | undefined {
  try {
    if (typeof amount === 'string') {
      return BigInt(amount)
    }
    if (typeof amount === 'bigint') return amount
  } catch (err) {
    console.log('Could not convert amount to bigint. Using undefined as default.', err)
  }

  return undefined
}
