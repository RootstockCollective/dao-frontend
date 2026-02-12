import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { ProposalState } from '@/shared/types'
import { Dispatch, SetStateAction } from 'react'
import { AbiFunction, Address } from 'viem'
import { TokenRewards } from './rewards'

// API Response Types
export interface DailyAllocationItem {
  id: string
  day: number
  totalAllocation: string
}

export interface CycleRewardsItem {
  id: string
  currentCycleStart: string
  currentCycleDuration: string
  previousCycleStart: string
  previousCycleDuration: string
  distributionDuration: string
  onDistributionPeriod: boolean
  rewardPerToken: Record<string, string>
}

export interface Builder {
  proposal: BuilderProposal
  address: Address
  builderName: string
  stateFlags?: BuilderStateFlags
  gauge?: Address
  backerRewardPct?: BackerRewardPercentage
}

export interface BuilderWithRewardShares extends Required<Builder> {
  rewardShares: bigint
}

export interface BuilderEstimatedRewards extends BuilderWithRewardShares {
  builderEstimatedRewardsPct: bigint
  backerEstimatedRewardsPct: bigint
  builderEstimatedRewards: TokenRewards
  backerEstimatedRewards: TokenRewards
}

export interface BackerEstimatedRewards extends Required<Builder> {
  backerEstimatedRewards: TokenRewards
}

export interface BuilderRewardsSummary extends BuilderEstimatedRewards {
  totalAllocation: bigint
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

interface BuilderProposal {
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

export type ProposalsToState = Record<string, ProposalState>

export type BuilderState = 'active' | 'inProgress'

export type CompleteBuilder = Required<Builder>

export interface StateWithUpdate<T> {
  value: T
  onChange: Dispatch<SetStateAction<T>>
}

export interface BackingPoint {
  day: Date | number | string
  backing: bigint
  backingWei?: bigint
}

export interface RewardsPoint {
  day: Date | number | string
  rewards: {
    rif: number | bigint
    rbtc: number | bigint
    usd?: number
  }
}

export interface CycleWindow {
  label: string
  start: Date
  end: Date
  cycleDuration: number
  cycleNumber?: number
}

interface ChartDataPoint extends BackingPoint {
  rewardsUSD?: bigint
  rewardsRif?: bigint
  rewardsRbtc?: bigint
  cycle?: number | null
  dayInCycle?: string | null
}

export interface TooltipPayload {
  payload: ChartDataPoint
  value: number
  name: string
  color: string
  dataKey: string
}
