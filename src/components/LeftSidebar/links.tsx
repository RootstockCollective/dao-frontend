import { ENV } from '@/lib/constants'

const regtest = {
  registerRns: '',
  tokenBridge: '',
  rif: '',
  rbtc: '',
  tokenResources: '',
}

const testnet = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  tokenResources: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
}

const mainnet = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  tokenResources: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
}

const environments = {
  regtest,
  testnet,
  mainnet,
}
// @ts-ignore
export const currentLinks = environments[ENV] as typeof testnet
