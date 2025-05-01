import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { CRDeprecatedAbi } from '@/lib/abis/CRDeprecatedAbi'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { HTMLProps } from 'react'
import { AbiFunction, AbiParameterToPrimitiveType } from 'viem'

export const abiNames = [
  'DAOTreasuryAbi',
  'RIFTokenAbi',
  'BuilderRegistryAbi',
  // To keep compatibility with the previous logs
  'CRDeprecatedAbi',
] as const
export const abis = [
  DAOTreasuryAbi,
  RIFTokenAbi,
  BuilderRegistryAbi,
  // To keep compatibility with the previous operations
  CRDeprecatedAbi,
] as const

export const supportedProposalActions = [
  'withdraw',
  'withdrawERC20',
  'communityApproveBuilder',
  'communityBanBuilder',
  // To keep compatibility with the previous operations
  'removeWhitelistedBuilder',
  'whitelistBuilder',
  'dewhitelistBuilder',
] as const

export type SupportedActionAbiName = (typeof abiNames)[number]

export type SupportedActionAbi = (typeof abis)[number]

export type AbiEntry = SupportedActionAbi[number]

export type FunctionEntry = Extract<AbiEntry, AbiFunction>

export type FunctionName = FunctionEntry['name']

export type FunctionInputs = FunctionEntry['inputs']

export type InputParameter = FunctionInputs[number]

export type InputParameterName = InputParameter['name']

export type FunctionEntryByName<F = FunctionName> = Extract<FunctionEntry, { name: F }>

export type SupportedProposalAction = FunctionEntryByName<(typeof supportedProposalActions)[number]>

export type SupportedProposalActionName = SupportedProposalAction['name']

export type InputParameterByFnByName<F = SupportedProposalActionName, I = InputParameterName> = Extract<
  FunctionEntryByName<F>['inputs'][number],
  { name: I }
>

export type InputParameterTypeByFnByName<
  F = SupportedProposalActionName,
  I = InputParameterName,
> = AbiParameterToPrimitiveType<InputParameterByFnByName<F, I>>

export type InputNameFormatMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [I in InputParameterByFnByName<FN, InputName> as I['name']]: string
}

export type ActionInputNameFormatMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [F in FunctionEntryByName<FN>['name']]: InputNameFormatMap<F, InputName>
}

export type InputValueComponentProps<T, E> = {
  value: T
  htmlProps?: HTMLProps<E>
}

export type InputValueComponent<T, E = JSX.Element> = (props: InputValueComponentProps<T, E>) => E

export type InputValueComposerMap<F = SupportedProposalActionName, InputName = InputParameterName> = {
  [I in InputParameterByFnByName<F, InputName> as I['name']]: InputValueComponent<
    InputParameterTypeByFnByName<F, I>
  >
}

export type ActionComposerMap<FN = SupportedProposalActionName, InputName = InputParameterName> = {
  [F in FunctionEntryByName<FN>['name']]: InputValueComposerMap<F, InputName>
}
