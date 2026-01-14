'use client'
import { useGetProposalSnapshot } from '@/app/proposals/hooks/useGetProposalSnapshot'
import {
  type SerializedDecodedData,
  getDiscourseLinkFromProposalDescription,
} from '@/app/proposals/shared/utils'
import { Header, Paragraph } from '@/components/Typography'
import { useParams } from 'next/navigation'
import { usePricesContext } from '@/shared/context/PricesContext'
import { type ParsedActionDetails, ProposalType } from './types'
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
import type { Proposal } from '../shared/types'
import { useProposalAddressResolution } from './hooks/useProposalAddressResolution'
import { useMemo } from 'react'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useDiscourseVideo } from '@/shared/hooks/useDiscourseVideo'

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

// Parse a single action from decoded data
const parseSingleAction = (action: SerializedDecodedData, prices: GetPricesResult): ParsedActionDetails => {
  if (action.type !== 'decoded') {
    // Fallback case - simple ETH transfer (no calldata)
    return {
      type: ProposalType.RAW_TRANSFER,
      amount: BigInt(action.value),
      tokenSymbol: RBTC,
      price: prices?.[RBTC]?.price ?? 0,
      toAddress: action.affectedAddress,
    }
  }

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
      // Decoded but not in our supported list - unsupported function
      return {
        type: ProposalType.UNKNOWN,
      }
  }
}

// Parse all actions in a proposal
const parseAllProposalActions = (
  calldatasParsed: SerializedDecodedData[],
  prices: GetPricesResult,
): ParsedActionDetails[] => {
  if (!calldatasParsed || calldatasParsed.length === 0) {
    return [{ type: ProposalType.UNKNOWN }]
  }

  return calldatasParsed.map(calldata => parseSingleAction(calldata, prices))
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

  // Parse all actions in the proposal
  const parsedActionsBase = useMemo(
    () => parseAllProposalActions(calldatasParsed, prices),
    [calldatasParsed, prices],
  )

  // Apply RNS resolution to the first action (most important for display)
  const firstActionWithRns = useProposalAddressResolution(parsedActionsBase[0])

  // Create updated result with RNS-resolved first action
  const parsedActions = useMemo<ParsedActionDetails[]>(
    () => [firstActionWithRns, ...parsedActionsBase.slice(1)],
    [parsedActionsBase, firstActionWithRns],
  )

  const voteOnProposalData = useVoteOnProposal(proposalId)
  const snapshot = useGetProposalSnapshot(proposalId)
  const { data: videoUrl } = useDiscourseVideo(getDiscourseLinkFromProposalDescription(description))

  return (
    <div className="min-h-screen flex flex-col gap-4 w-full max-w-full">
      <div className="md:flex items-center gap-4">
        <Header caps variant="h3" className="text-2xl lg:text-[32px] !tracking-normal !leading-[1.25]">
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
            <VideoPlayer url={videoUrl} className="p-4 md:p-6 order-1 md:order-4" />
            <div className="order-2 md:order-1">
              <ProposalProggressBar proposalState={voteOnProposalData.proposalState} />
            </div>
            <div className="order-3 md:order-2">
              <ProposalDetails
                name={name}
                description={description}
                proposer={proposer}
                startsAt={Starts}
                parsedActions={parsedActions}
              />
            </div>
            <div className="order-4 md:order-3">
              <Description description={description} />
            </div>
          </div>
          <TechnicalDetails proposalId={proposalId} snapshot={snapshot} />
        </div>
        <VotingDetails
          proposalId={proposalId}
          parsedActions={parsedActions}
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
