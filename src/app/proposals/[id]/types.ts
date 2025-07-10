// Types for proposal action parsing and details
export enum ProposalType {
  BUILDER_ACTIVATION = 'Builder Activation',
  BUILDER_DEACTIVATION = 'Builder Deactivation',
  WITHDRAW = 'Transfer of',
}

export interface ParsedActionDetails {
  type: ProposalType | string
  amount?: bigint // The amount being transferred or acted upon
  tokenSymbol?: string // The symbol of the token involved (e.g., RIF, RBTC)
  price?: number // The price of the token (if relevant)
  toAddress?: string // The recipient address (if relevant)
  builder?: string // The builder address (if relevant)
  // Add more fields as needed for other action types
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
