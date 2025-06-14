import { WeiPerEther } from '@/lib/constants'
import { parseEther } from 'viem'

export const getCyclePayout = (
  rifPrice: number,
  rbtcPrice: number,
  rifRewards: bigint,
  rbtcRewards: bigint,
) => {
  const rifPriceInWei = parseEther(rifPrice.toString())
  const rbtcPriceInWei = parseEther(rbtcPrice.toString())

  const rifAmount = rifRewards ?? 0n
  const rbtcAmount = rbtcRewards ?? 0n
  return (rifAmount * rifPriceInWei + rbtcAmount * rbtcPriceInWei) / WeiPerEther
}
