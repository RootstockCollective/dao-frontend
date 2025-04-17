import { config as envConfig } from 'dotenv'
import { Address, getAddress } from 'viem'

export const [, , ...args] = process.argv
export type Args = {
  nftContractAddress: Address
  boostPercentage: number
  env: string
}
const { nftContractAddress, boostPercentage, env } = args.reduce<Args>((acc, val) => {
  if (val.startsWith('--nft')) {
    acc.nftContractAddress = getAddress(val.split('=')[1]).toLowerCase() as Address
  }

  if (val.startsWith('--boost')) {
    acc.boostPercentage = parseFloat(val.split('=')[1])
  }

  if (val.startsWith('--env')) {
    acc.env = val.split('=')[1]
  }

  return acc
}, {} as Args)

if (!env || !nftContractAddress || isNaN(boostPercentage)) {
  throw new Error(
    'Usage: npx tsx .github/scripts/nft_boost/activateBoost.ts \\\
    --nft=<nftContractAddress> \\\
    --boost=<boostPercentage> \\\
    --env=<env>',
  )
}

console.info('nft: ', nftContractAddress)
console.info('Boost percentage: ', boostPercentage)
console.info('env: ', env)

if (boostPercentage < 0) {
  throw new Error('Boost percentage must be positive')
}

envConfig({
  path: `.env.${env}`,
})

export { boostPercentage, env, nftContractAddress }
