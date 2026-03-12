import { BufferAbi } from './BufferAbi'
import { PermissionsManagerAbi } from './PermissionsManagerAbi'
import { RBTCAsyncVaultAbi } from './RBTCAsyncVaultAbi'
import { SyntheticYieldAbi } from './SyntheticYieldAbi'

export * from './BufferAbi'
export * from './PermissionsManagerAbi'
export * from './RBTCAsyncVaultAbi'
export * from './SyntheticYieldAbi'

export type BufferAbi = typeof BufferAbi
export type PermissionsManagerAbi = typeof PermissionsManagerAbi
export type RBTCAsyncVaultAbi = typeof RBTCAsyncVaultAbi
export type SyntheticYieldAbi = typeof SyntheticYieldAbi

const abis = {
  BufferAbi,
  PermissionsManagerAbi,
  RBTCAsyncVaultAbi,
  SyntheticYieldAbi,
} as const

type BtcVaultAbiName = keyof typeof abis
type BtcVaultAbi = (typeof abis)[BtcVaultAbiName]

export const getAbi = (abiName: BtcVaultAbiName): BtcVaultAbi => abis[abiName]
