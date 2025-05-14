import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { parseEther } from 'viem'

type CycleData = {
  id: string
  rewardsERC20: bigint
  rewardsRBTC: bigint
}

type CyclePayoutData = {
  cycles: CycleData[]
}

const CYCLE_PAYOUT_QUERY = gql`
  query CyclePayout {
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      rewardsERC20
      rewardsRBTC
    }
  }
`

export const useGetCyclePayout = () => {
  const { prices } = usePricesContext()
  const { data, ...responseMeta } = useQuery<CyclePayoutData>(CYCLE_PAYOUT_QUERY)

  const cyclePayout = useMemo(() => {
    if (!data?.cycles?.length || !prices?.RIF?.price || !prices?.RBTC?.price) return 0n
    const { rewardsERC20, rewardsRBTC } = data.cycles[0]
    const {
      RIF: { price: rifPrice },
      RBTC: { price: rbtcPrice },
    } = prices

    const rewardsERC20InUSD = (rewardsERC20 ?? 0n) * parseEther(rifPrice.toString())
    const rewardsRBTCInUSD = (rewardsRBTC ?? 0n) * parseEther(rbtcPrice.toString())
    const totalRewardsInUSD = rewardsERC20InUSD + rewardsRBTCInUSD

    return totalRewardsInUSD / WeiPerEther
  }, [prices, data])

  return {
    cyclePayout,
    ...responseMeta,
  }
}
