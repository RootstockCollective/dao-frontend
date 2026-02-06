import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { AbiFunction } from 'viem'

export const abis = [
  DAOTreasuryAbi,
  RIFTokenAbi,
  BuilderRegistryAbi,
  // CR MVP: To keep compatibility with the MVP logs
  SimplifiedRewardDistributorAbi,
] as const

const _supportedProposalActions = [
  'withdraw',
  'withdrawERC20',
  'communityApproveBuilder',
  'communityBanBuilder',
  'dewhitelistBuilder',
  // CR MVP: To keep compatibility with the MVP logs
  'removeWhitelistedBuilder',
  'whitelistBuilder',
] as const

export type SupportedActionAbi = (typeof abis)[number]

type AbiEntry = SupportedActionAbi[number]

export type FunctionEntry = Extract<AbiEntry, AbiFunction>

type FunctionName = FunctionEntry['name']

export type FunctionInputs = FunctionEntry['inputs']

type FunctionEntryByName<F = FunctionName> = Extract<FunctionEntry, { name: F }>

type SupportedProposalAction = FunctionEntryByName<(typeof _supportedProposalActions)[number]>

export type SupportedProposalActionName = SupportedProposalAction['name']
