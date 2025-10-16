// Types for proposal action parsing and details
export enum ProposalType {
  BUILDER_ACTIVATION = 'Builder Activation',
  BUILDER_DEACTIVATION = 'Builder Deactivation',
  WITHDRAW = 'Transfer of',
}

export interface ParsedActionDetails {
  type: ProposalType | string
  amount?: bigint | string // The amount being transferred or acted upon (can be from blockchain or user input)
  tokenSymbol?: string // The symbol of the token involved (e.g., RIF, RBTC)
  price?: number // The price of the token (if relevant)
  toAddress?: string // The recipient address (if relevant)
  builder?: string // The builder address (if relevant)
  // Add more fields as needed for other action types
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
