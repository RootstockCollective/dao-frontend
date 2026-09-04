import { Address } from 'viem'

/**
 * Icon slug -> Pinata CID. Uploading an image once and referencing it by slug lets the
 * same icon be reused by a builder's addresses across networks.
 * this is a temporal solution while we implement this to be loaded from a server
 */
export const BUILDER_ICON_CIDS = {
  asamiClub: 'bafkreihslj76brclfpsk5hnknbf6rugil5vdvtktwc3olfj5mhjptfof5q',
  beexoWallet: 'bafkreihozpiuu22kdqnbqhwcvm3jdq3jfb3avdsa4qzwk3hctakla2xa3a',
  boltz: 'bafkreibywkzp7gtyzvqq4rqx7l4z5qmylp5rnhwifdtpwuxhrhv7c5szbm',
  dzap: 'bafkreig3jo3ai3q5opem4heeelrybxsrax5s6mtgzlqqnedg6net67eiba',
  layerBank: 'bafkreihj3x2jtzgoyllsdzbujndeeqxlartnyacovj7hdymh2ox7kklbqe',
  moneyOnChain: 'bafkreiar6n57migkzcyp6agh2biqef43iotilxsodpr4ijwdmilziykhty',
  openOcean: 'bafkreidtybakzuystxk456jbjjdsfszzd652yr4dg3lxaemtkw77bwcbrm',
  routerProtocol: 'bafkreibenzvp5n7c5wmrargc33kufcuwfw4au4c3td3h6mmqh4mazeze7a',
  sailingProtocol: 'bafkreidgu6lwsauaef6dwdkqle54zmz4llbcgoklpq2kamfrmjv455gulu',
  simpleFi: 'bafkreicfhmx2s2bgunwykjseyz3lvprbzjzacct4pdq4niarh4fe7jmyei',
  steerProtocol: 'bafkreigr5rzqjt6fk3pybv4oh44o2mpuqcn7z7r5r2omfinym6yos7jmfy',
  steliosAndMick: 'bafkreiawwtwag5nxjwws4m6a4yjvyn5t3kqmkl7tss6znlq3hybrnax7hu',
  symbiosis: 'bafkreidnpripb4tvqav7onyk3olyvgypj4tb7rqcuqegnipcmd53p7f5ue',
  tally: 'bafkreiejkeuah7ee73w2sxb4p7dny5rocrtxnddwmn5qqwwpv342atdm4a',
  tropykus: 'bafkreigi6cjhvsarwyq3qjkrzqvx7q45z56v5dqw7wica2ablx4f3dy3ku',
  vottun: 'bafkreieums7xvazyubnlulrwgdd7wjlxvfazkbuspnxcpiw2bixmygyjp4',
  wakeUpLabs: 'bafkreidbsjqaumrfmy7jpnq7u4hrkcrf3xkkhvlmwoa6kg2wsl6u4xngiu',
  wesatoshisLabs: 'bafkreiewryh4zous56mmj7s3b6l7csjfsd2vqr5ndzf5njrjfy64anzc3u',
  woodSwap: 'bafkreifw4kh4ofn7y3zaorgpg5zk2qp6rvz3ns7karmmhkgp73ufm74r4e',
  jxlabs: 'bafkreihafqeouj5w7ybdmg6zgdmb4c3n6usv4e4hrnk2fnzwj2t6bakrsi',
} as const satisfies Record<string, string>

export type BuilderIconKey = keyof typeof BUILDER_ICON_CIDS

/**
 * Builder address -> icon slug, for every network.
 */
const BUILDER_ICON_KEY_BY_ADDRESS: Record<string, BuilderIconKey> = {
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
