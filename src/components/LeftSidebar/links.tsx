import { ENV } from '@/lib/constants'

const testnet = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  flyover: 'https://dapp.testnet.flyover.rif.technology/',
  readMore: 'https://dev.rootstock.io/',
}

const mainnet = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  flyover: 'https://dapp.flyover.rif.technology/',
  readMore: 'https://dev.rootstock.io/',
}

const environments = {
  testnet,
  mainnet,
}
// @ts-ignore
export const currentLinks = environments[ENV] as typeof testnet
