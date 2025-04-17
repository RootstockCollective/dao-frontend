import { ENV } from '@/lib/constants'

const regtest = {
  registerRns: '',
  tokenBridge: '',
  rif: '',
  rbtc: '',
  getRif: '',
  forum: '',
}

const testnet = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
}

const mainnet = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
}

const environments = {
  regtest,
  testnet,
  mainnet,
}
// @ts-ignore
export const currentLinks = environments[ENV] as typeof testnet
