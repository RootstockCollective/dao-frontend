import { ENV } from '@/lib/constants'

const testnet = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
}

const mainnet = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
}

const environments = {
  testnet,
  mainnet,
}
// @ts-ignore
export const currentLinks = environments[ENV] as typeof testnet
