import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { ProposalState } from '@/shared/types'
import { Dispatch, JSX, SetStateAction } from 'react'
import { AbiFunction, Address } from 'viem'

export type Token = {
  symbol: string
  address: Address
}

export interface RewardAmount {
  value: bigint
  price: number
  symbol: string
  currency: string
}

export interface Reward {
  amount: RewardAmount
  logo?: JSX.Element
}
export type TokenRewards = Record<string, Reward>

export type Builder = {
  proposal: BuilderProposal
  stateFlags?: BuilderStateFlags
  gauge?: Address
  address: Address
  builderName: string
  backerRewardPct?: BackerRewardPercentage
}

export interface BuilderEstimatedRewards extends CompleteBuilder {
  builderEstimatedRewardsPct: bigint
  backerEstimatedRewardsPct: bigint
  builderEstimatedRewards: TokenRewards
  backerEstimatedRewards: TokenRewards
}

export interface BuilderRewardsSummary extends BuilderEstimatedRewards {
  backerAllocation?: bigint
  totalAllocationPercentage: bigint
  lastCycleRewards: TokenRewards
}

type BuilderFunctionOutputs = Extract<
  Extract<(typeof BuilderRegistryAbi)[number], AbiFunction>,
  {
    name: 'builderState'
  }
>['outputs']

export type BuilderStateFlags = {
  [key in Exclude<BuilderFunctionOutputs[number]['name'], 'pausedReason' | 'reserved'>]: boolean
}

export interface BuilderProposal {
  id: bigint
  name: string
  description: string
  date: string
}

export interface BackerRewardPercentage {
  current: bigint
  next: bigint
  previous: bigint
  cooldownEndTime: bigint
}

export type ProposalByBuilder = Record<Address, BuilderProposal>

export type ProposalsToState = Record<string, ProposalState>

export type BuilderState = 'active' | 'inProgress'

export type CompleteBuilder = Required<Builder>

export type StateWithUpdate<T> = {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}
