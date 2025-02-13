import dotenv from "dotenv";
import { getAddress } from "viem";
import { Chain, rootstock, rootstockTestnet } from "viem/chains";

dotenv.config();

const chainId = Number(process.env.CHAIN_ID);
if (!chainId) {
  throw new Error("CHAIN_ID not set");
}

const chainIdToNetwork: Record<number, Chain> = {
  30: rootstock,
  31: rootstockTestnet,
};
const network = chainIdToNetwork[chainId];
if (!network) {
  throw new Error("Unsupported chain id");
}

if (!process.env.BACKERS_MANAGER_ADDRESS) {
  throw new Error("BACKERS_MANAGER_ADDRESS not set");
}
const backersManagerAddress = getAddress(process.env.BACKERS_MANAGER_ADDRESS);

// constant address. Calculation based on sc: address public constant COINBASE_ADDRESS = address(uint160(uint256(keccak256("COINBASE_ADDRESS"))));
const rewardCoinbaseAddress = getAddress(
  "0xf7aB6CfaebbADfe8B5494022c4C6dB776Bd63b6b"
);

export { backersManagerAddress, network, rewardCoinbaseAddress };

