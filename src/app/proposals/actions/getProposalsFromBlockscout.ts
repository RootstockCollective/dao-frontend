import Big from '@/lib/big'
import { parseEventLogs, Log, Address, Hash, getAddress, isAddress, isHex } from 'viem'
import { unstable_cache } from 'next/cache'
import { GovernorAbi } from '@/lib/abis/Governor'
import {
  EventArgumentsParameter,
  getProposalCategoryFromParsedData,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'
import { BLOCKSCOUT_URL, GOVERNOR_ADDRESS } from '@/lib/constants'
import { PROPOSAL_CREATED_EVENT } from '@/lib/endpoints'

type ElementType<T> = T extends (infer U)[] ? U : never

type ProposalCreatedEventLog = ElementType<
  ReturnType<typeof parseEventLogs<typeof GovernorAbi, true, 'ProposalCreated'>>
>

type ProposalCreatedEventLogWithTimestamp = ProposalCreatedEventLog & {
  timeStamp: string
  blockNumber: string
}

/**
 * Converts a proposal with timestamp to EventArgumentsParameter format
 * This makes the conversion explicit and type-safe
 */
function toEventArgumentsParameter(proposal: ProposalCreatedEventLogWithTimestamp): EventArgumentsParameter {
  return {
    args: {
      description: proposal.args.description,
      proposalId: proposal.args.proposalId,
      proposer: proposal.args.proposer,
      targets: [...proposal.args.targets],
      calldatas: [...proposal.args.calldatas],
      voteStart: proposal.args.voteStart,
      voteEnd: proposal.args.voteEnd,
      values: [...proposal.args.values],
    },
    timeStamp: proposal.timeStamp,
    blockNumber: proposal.blockNumber,
  }
}

/**
 * Normalizes address to checksummed format
 * Blockscout returns valid addresses, so we just need to normalize them
 */
function toAddress(value: string): Address {
  return getAddress(value)
}

/**
 * Validates and converts topics array
 * Topics can be addresses or hashes, we validate they're valid hex strings
 */
function toTopics(topics: Array<null | string>): [] | [Address, ...Address[]] {
  const filtered = topics.filter((t): t is string => t !== null)

  if (filtered.length === 0) {
    return []
  }

  // Validate all topics are valid hex strings
  // For event logs, topics[0] is typically the event signature (hash)
  // and subsequent topics can be indexed parameters (addresses or hashes)
  const validatedTopics = filtered.map(topic => {
    if (!isHex(topic)) {
      throw new Error(`Invalid topic: ${topic}`)
    }
    // If it looks like an address (42 chars), validate and normalize it
    if (topic.length === 42 && isAddress(topic, { strict: false })) {
      return getAddress(topic)
    }
    // Otherwise, it's a hash - return as Address (which is compatible with Hash)
    return topic as Address
  })

  return validatedTopics as [Address, ...Address[]]
}

/**
 * Blockscout API response structure for getLogs
 */
interface BlockscoutLogResponse {
  message: string
  status: string
  result: BackendEventByTopic0ResponseValue[]
  next_page_params?: Record<string, string | number>
}

/**
 * Fetches all ProposalCreated event logs from Blockscout API with pagination
 */
async function fetchProposalLogsFromBlockscout(): Promise<BackendEventByTopic0ResponseValue[]> {
  const allLogs: BackendEventByTopic0ResponseValue[] = []
  let params: Record<string, string> = {
    module: 'logs',
    action: 'getLogs',
    address: GOVERNOR_ADDRESS.toLowerCase(),
    topic0: PROPOSAL_CREATED_EVENT,
    toBlock: 'latest',
    fromBlock: '0',
  }

  while (true) {
    try {
      const url = new URL(`${BLOCKSCOUT_URL}/api`)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Blockscout API error: ${response.status} ${response.statusText}`)
      }

      const data: BlockscoutLogResponse = await response.json()

      if (data.status !== '1' || !data.result) {
        console.error(`Blockscout API returned error: ${data.message || 'Unknown error'}`)
        break
      }

      if (data.result.length > 0) {
        allLogs.push(...data.result)
      }

      // Check for next page
      if (data.next_page_params && Object.keys(data.next_page_params).length > 0) {
        // Merge next_page_params with existing params for next iteration
        params = {
          ...params,
          ...Object.fromEntries(
            Object.entries(data.next_page_params).map(([key, value]) => [key, String(value)]),
          ),
        }
      } else {
        // No more pages, break the loop
        break
      }
    } catch (error) {
      console.error(
        `Failed to fetch logs from Blockscout: ${error instanceof Error ? error.message : String(error)}`,
      )
      break
    }
  }

  return allLogs
}

/**
 * Converts BackendEventByTopic0ResponseValue logs to viem Log format
 * This makes the conversion explicit and type-safe with proper validation
 */
function convertBackendLogsToViemLogs(logs: BackendEventByTopic0ResponseValue[]): Log[] {
  return logs.map((log, index) => {
    try {
      return {
        address: toAddress(log.address),
        blockHash: null,
        blockNumber: BigInt(log.blockNumber),
        data: log.data as Hash,
        logIndex: Number(log.logIndex),
        transactionHash: log.transactionHash as Hash,
        transactionIndex: Number(log.transactionIndex),
        removed: false,
        topics: toTopics(log.topics),
      }
    } catch (error) {
      throw new Error(
        `Failed to convert log at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  })
}

function transformEventLogProposal(proposal: ProposalCreatedEventLogWithTimestamp): ProposalApiResponse {
  const eventArgs = getProposalEventArguments(toEventArgumentsParameter(proposal))
  const category = getProposalCategoryFromParsedData(eventArgs.calldatasParsed, proposal.args.description)

  return {
    votingPeriod: Big(proposal.args.voteEnd.toString()).minus(Number(proposal.blockNumber)).toString(),
    proposalDeadline: proposal.args.voteEnd.toString(),
    voteStart: proposal.args.voteStart.toString(),
    voteEnd: proposal.args.voteEnd.toString(),
    category,
    proposer: proposal.args.proposer,
    description: proposal.args.description,
    proposalId: proposal.args.proposalId.toString(),
    blockNumber: proposal.blockNumber,
    name: eventArgs.name,
    Starts: eventArgs.Starts.toISOString(),
    calldatasParsed: serializeBigInts(eventArgs.calldatasParsed),
  }
}

async function getProposalsFromBlockscoutUncached(): Promise<ProposalApiResponse[]> {
  const logs = await fetchProposalLogsFromBlockscout()

  const viemLogs = convertBackendLogsToViemLogs(logs)
  const parsedProposals = parseEventLogs({
    abi: GovernorAbi,
    logs: viemLogs,
    eventName: 'ProposalCreated',
  })

  // Add timestamp and blockNumber from original data
  let proposals: ProposalCreatedEventLogWithTimestamp[] = parsedProposals.map((proposal, index) => ({
    ...proposal,
    timeStamp: logs[index]?.timeStamp ?? '0',
    blockNumber: logs[index]?.blockNumber ?? '0',
  })) as ProposalCreatedEventLogWithTimestamp[]

  proposals = proposals
    .filter(
      (proposal, index, self) =>
        self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
    )
    .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))

  return proposals.map(transformEventLogProposal)
}

export const getProposalsFromBlockscout = unstable_cache(
  getProposalsFromBlockscoutUncached,
  ['cached_proposals_blockscout'],
  {
    revalidate: 60, // 60 seconds
    tags: ['cached_proposals_blockscout'],
  },
)
