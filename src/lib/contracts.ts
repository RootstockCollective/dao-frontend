import { Address } from 'viem'

const testnet = {
  RIF: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe', // tRIF
  stRIF: '0xAF17f7A0124E9F360ffA484b13566b041C0f5023',
  rBTC: '0x0000000000000000000000000000000000000000',
}

const mainnet = {
  RIF: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  stRIF: '', // @TODO get DAO mainnet
  rBTC: '0x0000000000000000000000000000000000000000',
}

const contracts = {
  testnet,
  mainnet,
}

export type SupportedTokens = keyof typeof testnet | keyof typeof mainnet
// @ts-ignore
export const currentEnvContracts = contracts[process.env.NEXT_PUBLIC_ENV] as typeof testnet

const testnetNft = {
  RDEA: '0xa3076bcaCc7112B7fa7c5A87CF32275296d85D64',
}

const mainnetNft = {
  // TODO
  RDEA: '',
}

const contractsNFT = {
  testnet: testnetNft,
  mainnet: mainnetNft,
}
// @ts-ignore
export const currentEnvNFTContracts = contractsNFT[process.env.NEXT_PUBLIC_ENV] as typeof testnetNft

const treasuryContractsTestnet = [
  {
    name: 'Bucket 1',
    address: '0xf5b9Ccfe0F695195C4F2E2b5A99b9b5d79EB8089',
  },
]

const contractsTreasury = {
  testnet: treasuryContractsTestnet,
}

export const currentEnvTreasuryContracts = contractsTreasury[
  // @ts-ignore
  process.env.NEXT_PUBLIC_ENV
] as typeof treasuryContractsTestnet

const testnetGovernor = {
  value: '0x00ca74491D9493bFe5451246C8c72849Ba4A7F9D',
}
const mainnetGovernor = {
  value: '',
}

const governorContracts = {
  testnet: testnetGovernor,
  mainnet: mainnetGovernor,
}

// @ts-ignore
export const GovernorAddress = (governorContracts[process.env.NEXT_PUBLIC_ENV] as typeof testnetGovernor)
  ?.value as Address
