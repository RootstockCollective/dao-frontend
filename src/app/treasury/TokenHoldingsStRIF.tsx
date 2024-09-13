import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency, toFixed } from '@/lib/utils'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { usePricesContext } from '@/shared/context/PricesContext'

export const TokenHoldingsStRIF = () => {
  const { data } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })

  const balance = useMemo(() => Number(formatEther(data ?? 0n)), [data])
  const { prices } = usePricesContext()
  const symbol = 'stRIF'
  return (
    <>
      <p>{toFixed(balance)} stRIF</p>
      {prices[symbol] && (
        <p className="text-zinc-500">= USD {formatCurrency(prices[symbol].price * Number(balance) ?? 0)}</p>
      )}
    </>
  )
}
