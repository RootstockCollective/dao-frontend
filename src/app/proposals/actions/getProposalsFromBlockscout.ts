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
import { sentryServer } from '@/lib/sentry/sentry-server'

type ElementType<T> = T extends (infer U)[] ? U : never

type ProposalCreatedEventLog = ElementType<
  ReturnType<typeof parseEventLogs<typeof GovernorAbi, true, 'ProposalCreated'>>
>

interface ProposalCreatedEventLogWithTimestamp extends Omit<ProposalCreatedEventLog, 'blockNumber'> {
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
 * Uses fromBlock-based pagination: fetches until the last block number equals the fromBlock used
 * This is because endpoint does not return a cursor to know if there is a next page
 */
async function fetchProposalLogsFromBlockscout(): Promise<BackendEventByTopic0ResponseValue[]> {
  const allLogs: BackendEventByTopic0ResponseValue[] = []
  let fromBlock = '0'

  while (true) {
    try {
      const params: Record<string, string> = {
        module: 'logs',
        action: 'getLogs',
        address: GOVERNOR_ADDRESS.toLowerCase(),
        topic0: PROPOSAL_CREATED_EVENT,
        toBlock: 'latest',
        fromBlock,
      }

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

      if (data.result.length === 0) {
        // No more logs to fetch
        break
      }

      // Assume the last item has the highest block number (logs are typically ordered)
      // Blockscout returns blockNumber as hex string (e.g., '0x69b1e9'), convert to decimal number string
      const lastBlockNumberHex = data.result[data.result.length - 1].blockNumber
      const lastBlockNumber = parseInt(lastBlockNumberHex, 16).toString()
      // If the last block number equals the fromBlock we used, we've reached the end
      if (lastBlockNumber === fromBlock) {
        allLogs.push(...data.result)
        break
      }

      allLogs.push(...data.result)

      // Set fromBlock to the last block number (as decimal string) for the next iteration
      fromBlock = lastBlockNumber
    } catch (error) {
      console.error(
        `Failed to fetch logs from Blockscout: ${error instanceof Error ? error.message : String(error)}`,
      )
      const errorObj = error instanceof Error ? error : new Error(String(error))
      sentryServer.captureException(errorObj, {
        tags: {
          errorType: 'PROPOSALS_BLOCKSCOUT_ERROR',
        },
        extra: {
          fromBlock,
        },
      })
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

  // Create a map of proposalId to original index before deduplication
  // parseEventLogs returns proposals in the same order as logs, so indices align
  const proposalIdToIndex = new Map<bigint, number>()
  parsedProposals.forEach((proposal, index) => {
    // Only keep the first occurrence (lowest index) for each proposalId
    if (!proposalIdToIndex.has(proposal.args.proposalId)) {
      proposalIdToIndex.set(proposal.args.proposalId, index)
    }
  })

  // Remove duplicates based on proposalId before adding timestamp/blockNumber
  // Keep only the first occurrence of each proposalId
  const uniqueProposals = parsedProposals.filter(
    (proposal, index) => proposalIdToIndex.get(proposal.args.proposalId) === index,
  )

  // Add timestamp and blockNumber from original data
  // Since parseEventLogs maintains order with logs, we can use the original index directly
  let proposals: ProposalCreatedEventLogWithTimestamp[] = uniqueProposals.map(proposal => {
    const originalIndex = proposalIdToIndex.get(proposal.args.proposalId)!
    return {
      ...proposal,
      timeStamp: logs[originalIndex]?.timeStamp ?? '0',
      blockNumber: logs[originalIndex]?.blockNumber ?? '0',
    }
  }) as ProposalCreatedEventLogWithTimestamp[]

  proposals = proposals.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))

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
