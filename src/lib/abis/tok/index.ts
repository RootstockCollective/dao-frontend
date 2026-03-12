import { BackersManagerAbi } from './BackersManagerAbi'
import { BuilderRegistryAbi } from './BuilderRegistryAbi'
import { CycleTimeKeeperAbi } from './CycleTimeKeeperAbi'
import { GaugeAbi } from './GaugeAbi'
import { RewardDistributorAbi } from './RewardDistributorAbi'

export * from './BackersManagerAbi'
export * from './BuilderRegistryAbi'
export * from './CycleTimeKeeperAbi'
export * from './GaugeAbi'
export * from './RewardDistributorAbi'

export type BackersManagerAbi = typeof BackersManagerAbi
export type BuilderRegistryAbi = typeof BuilderRegistryAbi
export type CycleTimeKeeperAbi = typeof CycleTimeKeeperAbi
export type GaugeAbi = typeof GaugeAbi
export type RewardDistributorAbi = typeof RewardDistributorAbi

const abis = {
  BackersManagerAbi,
  BuilderRegistryAbi,
  CycleTimeKeeperAbi,
  GaugeAbi,
  RewardDistributorAbi,
} as const

type CollectiveRewardsAbiName = keyof typeof abis
type CollectiveRewardsAbi = (typeof abis)[CollectiveRewardsAbiName]

export const getAbi = (abiName: CollectiveRewardsAbiName): CollectiveRewardsAbi => abis[abiName]
