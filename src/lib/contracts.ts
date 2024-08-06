import { ZeroAddress } from 'ethers'
import { Address } from 'viem'
import { EarlyAdoptersNFTAbi } from './abis/EarlyAdoptersNFTAbi'
import {
  BUCKET1_ADDRESS,
  BUCKET2_ADDRESS,
  BUCKET3_ADDRESS,
  EA_NFT_ADDRESS,
  GOVERNOR_ADDRESS,
  MULTICALL_ADDRESS,
  RIF_ADDRESS,
  STRIF_ADDRESS,
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

const abiContractsMap: { [key: string]: any } = {
  [nftContracts?.EA.toLowerCase()]: EarlyAdoptersNFTAbi,
}

const treasuryContracts = [
  {
    name: 'Bucket 1',
    address: BUCKET1_ADDRESS,
  },
  {
    name: 'Bucket 2',
    address: BUCKET2_ADDRESS,
  },
  {
    name: 'Bucket 3',
    address: BUCKET3_ADDRESS,
  },
]

const GovernorAddress = GOVERNOR_ADDRESS
const MulticallAddress = MULTICALL_ADDRESS

export { tokenContracts, nftContracts, abiContractsMap, treasuryContracts, GovernorAddress, MulticallAddress }
