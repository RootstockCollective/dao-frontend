import { WeiPerEther } from '@/lib/constants'
import { parseEther } from 'viem'

export const getCyclePayout = (
  rifPrice: number,
  rbtcPrice: number,
  usdrifPrice: number,
  rifRewards: bigint,
  rbtcRewards: bigint,
  usdrifRewards: bigint,
) => {
  const rifPriceInWei = parseEther(rifPrice.toString())
  const rbtcPriceInWei = parseEther(rbtcPrice.toString())
  const usdrifPriceInWei = parseEther(usdrifPrice.toString())

  const rifAmount = rifRewards ?? 0n
  const rbtcAmount = rbtcRewards ?? 0n
  const usdrifAmount = usdrifRewards ?? 0n
  return (
    (rifAmount * rifPriceInWei + rbtcAmount * rbtcPriceInWei + usdrifAmount * usdrifPriceInWei) / WeiPerEther
  )
}
