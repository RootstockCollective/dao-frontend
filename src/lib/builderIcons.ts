import { Address } from 'viem'

/**
 * Slugs with an empty CID, and addresses that are not listed, fall back to the
 * generated jdenticon — so this can be filled in incrementally.
 */
export const BUILDER_ICON_CIDS = {
  //TODO clear these cids once we have the new icons
  asamiClub: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  beexoWallet: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  boltz: 'bafkreicevf2hewsyxysxogbrcvpcdh6yzfy63nwjwcsgwo6kdfl6ubgd7q',
  dzap: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  layerBank: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  moneyOnChain: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  openOcean: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  routerProtocol: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  sailingProtocol: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  simpleFi: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  steerProtocol: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  steliosAndMick: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  symbiosis: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  tally: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  tropykus: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  vottun: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  wakeUpLabs: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  wesatoshisLabs: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  woodSwap: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
} as const satisfies Record<string, string>

export type BuilderIconKey = keyof typeof BUILDER_ICON_CIDS

/**
 * Builder address -> icon slug, for every network.
 */
export const BUILDER_ICON_KEY_BY_ADDRESS: Record<string, BuilderIconKey> = {
  // ─── Rootstock mainnet (chainId 30) ───
  // Registry 0x8cb62c58AC3D1253c6467537FDDc563857eD76cb — snapshot 2026-09-03
  '0xd9fcae4315920387f00725c78285d6d41c30b967': 'asamiClub',
  '0xa42279209e7cc8da94dd3653fd7d8ac1ac744ada': 'beexoWallet',
  '0x6731b962e7fd2b1ec731bb17be3b8b3544e18896': 'boltz',
  '0x99e4694991830b757ead5562c2abf23f5448daa5': 'dzap', // DZap.io
  '0x9a9db4f6fd7525a5bb0422ec46264361371786c9': 'layerBank',
  '0x665078db7ee465b49d4f56f2acacc903f62623f2': 'moneyOnChain',
  '0x1d1114666d0f21e479c122c138a527dfbc0f2d00': 'openOcean',
  '0x9de55cc674ad3bcad89e4be68d9933fd382f2595': 'routerProtocol',
  '0x797e2cd952df539ccfea5554911afeb2a77fb760': 'sailingProtocol',
  '0x97054841be83be01871484d485ba85fbe39980db': 'simpleFi',
  '0xd9db26176dd2a905aaf9213581366a5bb3913573': 'steerProtocol',
  '0x47e1b5ef828559226f987bda82e8a506bbc9cf2f': 'steliosAndMick', // Stelios & Mick (Geyser Team)
  '0x7c5d5222f60853159bbdcc058088587618d61b24': 'symbiosis',
  '0x9684fe1ec8829f72c9b6f4cf2ca81a1a81e8bff0': 'vottun',
  '0x9dfa9dfd15d2b2fa9717b4fc545c2bb35a29215c': 'wakeUpLabs',
  '0x1da45683bd3ccd6f8308050d0d99c1ee7f761e5f': 'wesatoshisLabs',
  '0x2953336c73ba33f9c1791031cf95a412e217a295': 'woodSwap',
  // Halted gauges — still listed in the table, so they can have icons too
  '0x7be0c111b96b5282f4e16ac87129b34dde19c6d6': 'beexoWallet', // halted
  '0x920a531871f524f49c4346b2528260ff152d3c4e': 'tally', // halted
  '0x9763146dd94e0e6fd96ca88839e88ebda34a7f94': 'tropykus', // halted

  // ─── Rootstock testnet (chainId 31) ───
  '0x1768813c5cff9b11d62d8029ee481e82b383f498': 'moneyOnChain',
  '0xb73ffb572cbf14d382a0b698250f79b31fa32962': 'asamiClub',
  '0x623Ab477eAB37C65E90726F86Fd4ebFfEB274a47': 'boltz',
  // Registries in use: 0x5fc1dd93… (.env.testnet), 0xad125E6D… (.env.dev/.env.dao.qa),
  // 0xDf1ED223… (.env.cr.qa/.env.testnet.local).
}

/**
 * Same map, with every key lowercased, so an entry pasted in checksummed form
 * still resolves instead of silently falling back to the jdenticon.
 */
const NORMALIZED_KEY_BY_ADDRESS: Record<string, BuilderIconKey> = Object.fromEntries(
  Object.entries(BUILDER_ICON_KEY_BY_ADDRESS).map(([address, key]) => [address.toLowerCase(), key]),
)

/**
 * Resolves the IPFS CID configured for a builder, if any.
 *
 * @param address - Builder address on any supported network (any casing)
 * @returns The configured CID, or `undefined` when the builder has no custom icon
 */
export function getBuilderIconCid(address?: Address | string | null): string | undefined {
  if (!address) return undefined
  const key = NORMALIZED_KEY_BY_ADDRESS[address.toLowerCase()]
  return key ? BUILDER_ICON_CIDS[key] || undefined : undefined
}
