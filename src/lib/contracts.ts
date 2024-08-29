import { ZeroAddress } from 'ethers'
import { Address } from 'viem'
import { EarlyAdoptersNFTAbi } from './abis/EarlyAdoptersNFTAbi'
import {
  BUCKET1_ADDRESS,
  BUCKET2_ADDRESS,
  BUCKET3_ADDRESS,
  BUCKET4_ADDRESS,
  EA_NFT_ADDRESS,
  GOVERNOR_ADDRESS,
  MULTICALL_ADDRESS,
  RIF_ADDRESS,
  STRIF_ADDRESS,
  TREASURY_ADDRESS,
} from './constants'

const tokenContracts = {
  RIF: RIF_ADDRESS,
  stRIF: STRIF_ADDRESS,
  RBTC: ZeroAddress as Address,
}
export type SupportedTokens = keyof typeof tokenContracts

const nftContracts = {
  EA: EA_NFT_ADDRESS, // Early Adopters
}

const abiContractsMap = {
  [nftContracts.EA]: EarlyAdoptersNFTAbi,
}

const treasuryContracts = [
  {
    name: 'Growth',
    address: BUCKET1_ADDRESS,
  },
  {
    name: 'Grants - Active',
    address: BUCKET2_ADDRESS,
  },
  {
    name: 'Grants',
    address: BUCKET3_ADDRESS,
  },
  {
    name: 'General',
    address: BUCKET4_ADDRESS,
  },
]

const GovernorAddress = GOVERNOR_ADDRESS
const MulticallAddress = MULTICALL_ADDRESS

const TreasuryAddress = TREASURY_ADDRESS

export {
  tokenContracts,
  nftContracts,
  abiContractsMap,
  treasuryContracts,
  GovernorAddress,
  MulticallAddress,
  TreasuryAddress,
}
