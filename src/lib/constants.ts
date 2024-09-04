import { Address } from 'viem'

export const ENV = process.env.NEXT_PUBLIC_ENV
export const RIF_WALLET_SERVICES_URL = process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER

export const RIF_ADDRESS = process.env.NEXT_PUBLIC_RIF_ADDRESS as Address
export const STRIF_ADDRESS = process.env.NEXT_PUBLIC_STRIF_ADDRESS as Address
export const GOVERNOR_ADDRESS = process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS as Address
export const EA_NFT_ADDRESS = process.env.NEXT_PUBLIC_EA_NFT_ADDRESS?.toLowerCase() as Address
export const MULTICALL_ADDRESS = process.env.NEXT_PUBLIC_MULTICALL_ADDRESS as Address
export const BUCKET1_ADDRESS = process.env.NEXT_PUBLIC_BUCKET1_ADDRESS as Address
export const BUCKET2_ADDRESS = process.env.NEXT_PUBLIC_BUCKET2_ADDRESS as Address
export const BUCKET3_ADDRESS = process.env.NEXT_PUBLIC_BUCKET3_ADDRESS as Address

export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address

export const SIMPLIFIED_REWARD_DISTRIBUTOR_ADDRESS = process.env
  .NEXT_PUBLIC_SIMPLIFIED_REWARD_DISTRIBUTOR_ADDRESS as Address
export const EPOCH_DURATION_IN_DAYS = process.env.NEXT_PUBLIC_EPOCH_DURATION_IN_DAYS
export const FIRST_EPOCH_START_DATE_ISO = process.env.NEXT_PUBLIC_FIRST_EPOCH_START_DATE_ISO
