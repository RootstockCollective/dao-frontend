import { ENV } from '@/lib/constants'

interface Resources {
  registerRns: string
  tokenBridge: string
  rif: string
  rbtc: string
  getRif: string
  forum: string
  stakeRif: string
  allocations: string
}

const testnet: Resources = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
}

const mainnet: Resources = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
}

const regtest: Resources = {
  registerRns: '',
  tokenBridge: '',
  rif: '',
  rbtc: '',
  getRif: '',
  stakeRif: '',
  forum: '',
  allocations: '',
}

const environments = {
  regtest,
  testnet,
  mainnet,
}

export const currentLinks: Resources = environments[ENV as keyof typeof environments]
