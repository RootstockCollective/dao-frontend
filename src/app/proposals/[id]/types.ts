// Types for proposal action parsing and details
export enum ProposalType {
  BUILDER_ACTIVATION = 'Builder approval',
  BUILDER_DEACTIVATION = 'Builder Deactivation',
  WITHDRAW = 'Transfer',
  RAW_TRANSFER = 'Raw',
  UNKNOWN = 'Unknown action',
}

export interface ParsedActionDetails {
  type: ProposalType | string
  amount?: bigint | string // The amount being transferred or acted upon (can be from blockchain or user input)
  tokenSymbol?: string // The symbol of the token involved (e.g., RIF, RBTC)
  price?: number // The price of the token (if relevant)
  toAddress?: string // The recipient address (if relevant)
  builder?: string // The builder address (if relevant)
  rns?: string // The RNS domain name for the address (resolved asynchronously)
  // Add more fields as needed for other action types
}
