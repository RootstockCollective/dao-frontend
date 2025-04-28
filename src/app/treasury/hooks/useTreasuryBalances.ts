import { fetchAddressTokens } from '@/app/user/Balances/actions'
import Big from '@/lib/big'
import { CHAIN_ID } from '@/lib/constants'
import { treasuryContracts } from '@/lib/contracts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'

interface TreasuryBalance {
  symbol: string
  balance: string
}

interface TokenData {
  contractAddress: string
  balance: string
  decimals: number
  symbol: string
}

const fetchAllTokenData = async (addresses: Address[]): Promise<TokenData[]> => {
  const requests = addresses.map(addr => fetchAddressTokens(addr, Number(CHAIN_ID)))
  const responses = await Promise.all(requests)
  return responses.flatMap(res => res.data)
}

export function useTreasuryBalances(whitelistedTokens: string[]) {
  const treasuryAddresses = useMemo(() => Object.values(treasuryContracts).map(({ address }) => address), [])

  const [balances, setBalances] = useState<TreasuryBalance[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchBalances = useCallback(async () => {
    setLoading(true)

    try {
      // TODO: cache this data
      const tokens = await fetchAllTokenData(treasuryAddresses)

      const totals = tokens
        .filter(token => whitelistedTokens.includes(token.contractAddress))
        .reduce(
          (acc, token) => {
            const isHex = token.balance.startsWith('0x')
            const tokenBalance = isHex ? BigInt(token.balance).toString() : token.balance
            const tokenAmount = Big(tokenBalance).div(Big(10).pow(token.decimals)).toNumber()
            const isRif = token.symbol.toLowerCase() === 'rif'
            const balance = Number(acc[token.symbol] || 0) + tokenAmount
            acc[token.symbol] = isRif ? Big(balance).ceil().toString() : Big(balance).toFixedNoTrailing(8)
            return acc
          },
          {} as Record<string, string>,
        )

      const balances = Object.entries(totals).map(([symbol, balance]) => ({
        symbol,
        balance,
      }))
      setBalances(balances)
    } catch (err) {
      console.error('Error fetching token data:', err)
      setBalances([])
    } finally {
      setLoading(false)
    }
  }, [treasuryAddresses, whitelistedTokens])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return { balances, loading }
}
