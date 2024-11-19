import { Address } from 'viem'
import { BuilderStatusShown } from '../types'

export type BuilderStatus = BuilderStatusShown | 'Paused' | 'Deactivated'

export type BuilderAllocationProps = {
  builderName: string
  address: Address
  status: BuilderStatus
  joiningDate: string
  allocationLeft: BigInt
  // TODO: what's the value we expect here? (e.g. 8% or 8.123456%)
  backerRewards: number
  currentAllocation: number
}
