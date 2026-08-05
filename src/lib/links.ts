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
  feedbackForm: string
  getRifSushi: string
  getRifSymbiosis: string
  getRifOku: string
  getRifBinance: string
  getRbtcOku: string
  getRbtcSymbiosisFromBtc: string
}

/**
 * Staking onboarding destinations, shared by every environment.
 *
 * These are external mainnet services and none of them supports Rootstock testnet (Sushi
 * renders "Not Found" for rootstock-testnet, Symbiosis does not list chain 31, Oku redirects
 * to a 404). There is nowhere else to acquire real RIF, so a testnet build points at the same
 * places a mainnet build does.
 *
 * Every URL below was confirmed to land with the chain and token preselected.
 */
const onboardingProviders = {
  getRifSushi:
    'https://www.sushi.com/rootstock/swap?token0=NATIVE&token1=0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  getRifSymbiosis:
    'https://app.symbiosis.finance/swap?chainIn=Ethereum&chainOut=Rootstock&tokenIn=ETH&tokenOut=0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  // Bridges straight to RIF: confirmed to land on Oku with ETH selected to sell and Rootstock
  // RIF to buy. Oku only quotes a route behind a connected wallet, but that is true of the
  // whole aggregator and is not a reason to send the user somewhere they did not ask to go.
  getRifOku:
    'https://oku.trade/bridge?inputChain=ethereum&inToken=0x0000000000000000000000000000000000000000&outputChain=rootstock&outToken=0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  getRifBinance: 'https://www.binance.com/en/trade/RIF_USDT?type=spot',
  getRbtcOku:
    'https://oku.trade/bridge?inputChain=ethereum&inToken=0x0000000000000000000000000000000000000000&outputChain=rootstock&outToken=0x0000000000000000000000000000000000000000',
  // Oku's Rootstock bridge providers are EVM-only, so BTC -> rBTC has to go through Symbiosis.
  // Oku already covers the ETH -> rBTC path, so only the BTC one is surfaced here.
  getRbtcSymbiosisFromBtc:
    'https://app.symbiosis.finance/swap?chainIn=Bitcoin&chainOut=Rootstock&tokenIn=BTC&tokenOut=RBTC',
} as const

const testnet = {
  registerRns: 'https://testnet.manager.rns.rifos.org/',
  tokenBridge: 'https://testnet.tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
  feedbackForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSeCzwut4WppI-YPc0AwNdbi5FVyOXGsTroZO5y-W7KVnpgS5A/viewform?usp=sharing&ouid=108559399286825656764',
  ...onboardingProviders,
} as const satisfies Resources

const mainnet = {
  registerRns: 'https://manager.rns.rifos.org/',
  tokenBridge: 'https://tokenbridge.rsk.co/',
  rif: 'https://www.coingecko.com/en/coins/rsk-infrastructure-framework/',
  rbtc: 'https://rootstock.io/rbtc/#get-rbtc/',
  getRif: 'https://wiki.rootstockcollective.xyz/Token-Resources-e3f89008a96e4dcab3037ff7861d9d8a',
  stakeRif: 'https://rootstockcollective.xyz/rootstockcollective-101-staking-rif/',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: 'https://rootstockcollective.xyz/collective-rewards-how-to-become-a-backer/',
  feedbackForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSeCzwut4WppI-YPc0AwNdbi5FVyOXGsTroZO5y-W7KVnpgS5A/viewform?usp=sharing&ouid=108559399286825656764',
  ...onboardingProviders,
} as const satisfies Resources

const regtest = {
  registerRns: '',
  tokenBridge: '',
  rif: '',
  rbtc: '',
  getRif: '',
  stakeRif: '',
  forum: 'https://gov.rootstockcollective.xyz',
  allocations: '',
  feedbackForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSeCzwut4WppI-YPc0AwNdbi5FVyOXGsTroZO5y-W7KVnpgS5A/viewform?usp=sharing&ouid=108559399286825656764',
  ...onboardingProviders,
} as const satisfies Resources

// Fork uses mainnet links since it's a fork of mainnet
const fork = mainnet

const environments = {
  regtest,
  testnet,
  mainnet,
  fork,
}

export const currentLinks = environments[ENV as keyof typeof environments]
