// Balances

// TODO use fetch(`https://rif-wallet-services.testnet.rifcomputing.net/address/${address}/tokens?chainId=31`) 
import { GetAddressTokenResult, GetPricesResult } from '@/app/user/types'

export const fetchAddressTokens = (address: string, chainId = 31) => fetch(
  `http://localhost:3007/address/${address}/tokens?chainId=${chainId}`
)
  .then((data) => data.json() as Promise<GetAddressTokenResult>)

// Prices

// TODO add more contracts (RBTC, stRIF, etc...)
const tokenContractsSymbolMap: Record<string, string> = {
  '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5': 'RIF',
  '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe': 'tRIF'
}
export const fetchPrices = () => fetch(
  `http://localhost:3007/price?addresses=${Object.keys(tokenContractsSymbolMap).join(',')}&convert=USD`
)
  .then((data) => data.json() as Promise<GetPricesResult>)
  .then((prices) => {
    const pricesReturn: GetPricesResult = {}
    for (const contract in prices) {
      if (contract in tokenContractsSymbolMap) {
        pricesReturn[tokenContractsSymbolMap[contract]] = prices[contract]
      }
    }
    return pricesReturn
  })
