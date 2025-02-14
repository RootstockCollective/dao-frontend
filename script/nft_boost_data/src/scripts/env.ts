import dotenv from 'dotenv'
import { getAddress } from 'viem'
import { Chain, rootstock, rootstockTestnet } from 'viem/chains'

dotenv.config()

const chainId = Number(process.env.CHAIN_ID)
if (!chainId) {
  throw new Error('CHAIN_ID not set')
}

const chainIdToNetwork: Record<number, Chain> = {
  30: rootstock,
  31: rootstockTestnet,
}
const network = chainIdToNetwork[chainId]
if (!network) {
  throw new Error('Unsupported chain id')
}

if (!process.env.BACKERS_MANAGER_ADDRESS) {
  throw new Error('BACKERS_MANAGER_ADDRESS not set')
}
const backersManagerAddress = getAddress(process.env.BACKERS_MANAGER_ADDRESS)

export { backersManagerAddress, network }
