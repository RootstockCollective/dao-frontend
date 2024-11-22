import { ProposalState } from '@/shared/types'
import { AbiFunction, Address } from 'viem'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'

export type Builder = {
  proposal: BuilderProposal
  stateFlags?: BuilderStateFlags
  gauge?: Address
  address: Address
  builderName: string
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

export type BuilderProposal = {
  id: bigint
  name: string
  description: string
  date: string
}

export type ProposalByBuilder = Record<Address, BuilderProposal>

export type ProposalsToState = Record<string, ProposalState>

export type BuilderState = 'active' | 'inProgress'
