import RLogin from '@rsksmart/rlogin'

const rpcUrls = {
  30: 'https://public-node.rsk.co',
  31: 'https://public-node.testnet.rsk.co',
  1337: 'http://localhost:8545',
}

const supportedChains = Object.keys(rpcUrls).map(Number)

const infoOptions = {
  30: { addressBaseURL: 'https://explorer.rsk.co/address/' },
  31: { addressBaseURL: 'https://explorer.testnet.rsk.co/address/' },
}

export const rLoginConnector = new RLogin({
  rpcUrls,
  supportedChains,
  infoOptions,
})
