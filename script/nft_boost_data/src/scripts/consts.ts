import { getAddress } from 'viem'

// constant address. Calculation based on sc: address public constant COINBASE_ADDRESS = address(uint160(uint256(keccak256("COINBASE_ADDRESS"))));
const rewardCoinbaseAddress = getAddress('0xf7aB6CfaebbADfe8B5494022c4C6dB776Bd63b6b')

const boostDataFolder = 'boostData'
const nftActiveBoostPath = `${boostDataFolder}/active.txt`

export { boostDataFolder, nftActiveBoostPath, rewardCoinbaseAddress }
