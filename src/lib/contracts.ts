import { Address } from 'viem'
import { EarlyAdoptersNFTAbi } from './abis/EarlyAdoptersNFTAbi'

const regtest = {
  RIF: process.env.REGTEST_RIF || '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe', // tRIF
  stRIF: process.env.REGTEST_STRIF || '0xAF17f7A0124E9F360ffA484b13566b041C0f5023',
  rBTC: '0x0000000000000000000000000000000000000000',
  multicall: process.env.REGTEST_MULTICALL || '0xcA11bde05977b3631167028862bE2a173976CA11',
}

const testnet = {
  RIF: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe', // tRIF
  stRIF: '0xAF17f7A0124E9F360ffA484b13566b041C0f5023',
  rBTC: '0x0000000000000000000000000000000000000000',
  multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
}

const mainnet = {
  RIF: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  stRIF: '', // @TODO get DAO mainnet
  rBTC: '0x0000000000000000000000000000000000000000',
  multicall: '',
}

const contracts = {
  regtest,
  testnet,
  mainnet,
}

export type SupportedTokens = keyof typeof testnet | keyof typeof mainnet
// @ts-ignore
export const currentEnvContracts = contracts[process.env.NEXT_PUBLIC_ENV] as typeof testnet

const regtestNft = {
  RDEA: process.env.REGTEST_RDEA || '0xa3076bcaCc7112B7fa7c5A87CF32275296d85D64' as Address, // RIF DAO Early Adopters
  EA: process.env.REGTEST_EA || '0xf24761C1B57b14EeA270B1485294D93494164246' as Address, // Early Adopters
}

const testnetNft = {
  RDEA: '0xa3076bcaCc7112B7fa7c5A87CF32275296d85D64' as Address, // RIF DAO Early Adopters
  EA: '0xf24761C1B57b14EeA270B1485294D93494164246' as Address, // Early Adopters
}

const mainnetNft = {
  // TODO
  RDEA: '',
  EA: '',
}

const contractsNFT = {
  regtest: regtestNft,
  testnet: testnetNft,
  mainnet: mainnetNft,
}
// @ts-ignore
export const currentEnvNFTContracts = contractsNFT[process.env.NEXT_PUBLIC_ENV] as typeof testnetNft

export const abiContractsMap: { [key: string]: any } = {
  [currentEnvNFTContracts?.EA.toLowerCase()]: EarlyAdoptersNFTAbi,
}

const regtestTreasuryContractsConfig = process.env.REGTEST_TREASURY_CONTRACTS;
const treasuryContractsRegtest = regtestTreasuryContractsConfig && regtestTreasuryContractsConfig.split(',').map((contract: string, i) => ({
  name: `Bucket ${i + 1}`,
  address: contract,
}));

const treasuryContractsTestnet = [
  {
    name: 'Bucket 1',
    address: '0xf5b9Ccfe0F695195C4F2E2b5A99b9b5d79EB8089',
  },
  {
    name: 'Bucket 2',
    address: '0x8d90a8f30fBC93D9BB62758502bBCB640e59d0f4',
  },
  {
    name: 'Bucket 3',
    address: '0x1E6406ddcf3c9Ab882686d4c9d80d184e7f3bF02',
  },
]

const contractsTreasury = {
  regtest: treasuryContractsRegtest,
  testnet: treasuryContractsTestnet,
}

export const currentEnvTreasuryContracts = contractsTreasury[
  // @ts-ignore
  process.env.NEXT_PUBLIC_ENV
] as typeof treasuryContractsTestnet

// TODO: config
const regtestGovernor = {
  value: '0x00ca74491D9493bFe5451246C8c72849Ba4A7F9D',
}

const testnetGovernor = {
  value: '0x00ca74491D9493bFe5451246C8c72849Ba4A7F9D',
}
const mainnetGovernor = {
  value: '',
}

const governorContracts = {
  regtest: regtestGovernor,
  testnet: testnetGovernor,
  mainnet: mainnetGovernor,
}

// @ts-ignore
export const GovernorAddress = (governorContracts[process.env.NEXT_PUBLIC_ENV] as typeof testnetGovernor)
  ?.value as Address
