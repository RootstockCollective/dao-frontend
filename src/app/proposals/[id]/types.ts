// Types for proposal action parsing and details
import { ProposalType } from '../create/CreateProposalHeaderSection'

export interface ParsedActionDetails {
  type: ProposalType | string
  display: string
  amount?: bigint
  tokenSymbol?: string
  price?: number
  toAddress?: string
  builder?: string
}

export interface ActionDetailsProps {
  calldatasParsed: any
  actionType: any
  parsedAction: ParsedActionDetails
}

export enum ActionType {
  BuilderApproval = 'Builder approval',
  TreasuryWithdrawal = 'Treasury withdrawal',
  Transfer = 'Transfer',
  WhitelistBuilder = 'Whitelist builder',
  RemoveBuilder = 'Remove builder',
  DewhitelistBuilder = 'De-whitelist builder',
  Unknown = '—',
}

export interface RenderWithdrawActionArgs {
  toAddress: string
  amount: bigint
  currencySymbol: string
  price: number
  paramLabels: Record<string, string>
}

export type ParamLabels = Record<string, string>
export type ParamComponents = Record<string, React.ComponentType<any>>
