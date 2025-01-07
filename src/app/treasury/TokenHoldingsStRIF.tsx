import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Paragraph } from '@/components/Typography'

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
      <Paragraph size="small">{formatNumberWithCommas(Math.ceil(Number(balance)))} stRIF</Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500">
          = USD {formatCurrency(prices[symbol].price * Number(balance)) ?? 0}
        </Paragraph>
      )}
    </>
  )
}
