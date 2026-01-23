import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { HTMLProps, JSX } from 'react'
import { AbiFunction, AbiParameterToPrimitiveType } from 'viem'

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

type InputParameter = FunctionInputs[number]

type InputParameterName = InputParameter['name']

type FunctionEntryByName<F = FunctionName> = Extract<FunctionEntry, { name: F }>

type SupportedProposalAction = FunctionEntryByName<(typeof _supportedProposalActions)[number]>

export type SupportedProposalActionName = SupportedProposalAction['name']

type InputParameterByFnByName<F = SupportedProposalActionName, I = InputParameterName> = Extract<
  FunctionEntryByName<F>['inputs'][number],
  { name: I }
>

type InputParameterTypeByFnByName<
  F = SupportedProposalActionName,
  I = InputParameterName,
> = AbiParameterToPrimitiveType<InputParameterByFnByName<F, I>>

type InputNameFormatMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [I in InputParameterByFnByName<FN, InputName> as I['name']]: string
}

type _ActionInputNameFormatMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [F in FunctionEntryByName<FN>['name']]: InputNameFormatMap<F, InputName>
}

type InputValueComponentProps<T, E> = {
  value: T
  htmlProps?: HTMLProps<E>
}

type InputValueComponent<T, E = JSX.Element> = (props: InputValueComponentProps<T, E>) => E

type InputValueComposerMap<F = SupportedProposalActionName, InputName = InputParameterName> = {
  [I in InputParameterByFnByName<F, InputName> as I['name']]: InputValueComponent<
    InputParameterTypeByFnByName<F, I>
  >
}

type _ActionComposerMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [F in FunctionEntryByName<FN>['name']]: InputValueComposerMap<F, InputName>
}
