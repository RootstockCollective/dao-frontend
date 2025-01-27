import { Paragraph } from '@/components/Typography'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import Big from '@/lib/big'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export const TokenHoldingsStRIF = () => {
  const { data } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })

  const balance = useMemo(() => Big(formatEther(data ?? 0n)), [data])
  const { prices } = usePricesContext()
  const symbol = 'stRIF'
  return (
    <>
      <Paragraph size="small">{formatNumberWithCommas(balance.ceil().toNumber())} stRIF</Paragraph>
      {prices[symbol] && (
        <Paragraph size="small" className="text-zinc-500">
          = USD {formatCurrency(Big(prices[symbol].price).mul(balance).toNumber() ?? 0)}
        </Paragraph>
      )}
    </>
  )
}
