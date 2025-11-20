import Big from '@/lib/big'
import { parseEventLogs, Log, Address, Hash, getAddress, isAddress, isHex } from 'viem'
import { fetchProposalCreated } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import {
  EventArgumentsParameter,
  getProposalCategory,
  getProposalEventArguments,
  serializeBigInts,
} from '@/app/proposals/shared/utils'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'

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
 * Validates and converts a string to Address type
 * Throws if the string is not a valid address
 */
function toAddress(value: string): Address {
  if (!isAddress(value, { strict: false })) {
    throw new Error(`Invalid address: ${value}`)
  }
  return getAddress(value)
}

/**
 * Validates and converts a string to Hash type
 * Throws if the string is not a valid hex string
 */
function toHash(value: string): Hash {
  if (!isHex(value)) {
    throw new Error(`Invalid hash: ${value}`)
  }
  return value as Hash
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
        data: toHash(log.data),
        logIndex: Number(log.logIndex),
        transactionHash: toHash(log.transactionHash),
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
  const category = getProposalCategory(eventArgs.calldatasParsed)

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

export async function getProposalsFromNode(): Promise<ProposalApiResponse[]> {
  const data = await fetchProposalCreated(0)

  const viemLogs = convertBackendLogsToViemLogs(data.data)
  const parsedProposals = parseEventLogs({
    abi: GovernorAbi,
    logs: viemLogs,
    eventName: 'ProposalCreated',
  })

  // Add timestamp and blockNumber from original data
  let proposals: ProposalCreatedEventLogWithTimestamp[] = parsedProposals.map((proposal, index) => ({
    ...proposal,
    timeStamp: data.data[index]?.timeStamp ?? '0',
    blockNumber: data.data[index]?.blockNumber ?? '0',
  })) as ProposalCreatedEventLogWithTimestamp[]

  proposals = proposals
    .filter(
      (proposal, index, self) =>
        self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
    )
    .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))

  return proposals.map(transformEventLogProposal)
}
