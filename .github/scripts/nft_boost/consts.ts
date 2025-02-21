import { getAddress } from 'viem'
import { ENV } from '../../../src/lib/constants'

// constant address. Calculation based on sc: address public constant COINBASE_ADDRESS = address(uint160(uint256(keccak256("COINBASE_ADDRESS"))));
const rewardCoinbaseAddress = getAddress('0xf7aB6CfaebbADfe8B5494022c4C6dB776Bd63b6b')

const boostDataBranch = "boost_data/" + ENV
const boostDataFolder = `${boostDataBranch}/nft_boost_data`
const nftActiveBoostPath = `${boostDataFolder}/latest`

export { boostDataFolder, nftActiveBoostPath, rewardCoinbaseAddress }
