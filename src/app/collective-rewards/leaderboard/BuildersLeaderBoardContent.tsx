import { BuildersLeaderBoardTable } from '@/app/collective-rewards/leaderboard'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards'
import { Search, SearchContextProvider } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Typography } from '@/components/Typography'
import { COINBASE_ADDRESS } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { getAddress } from 'viem'
import Image from 'next/image'

const EmptyLeaderboard = () => (
  <div className="relative w-full py-6">
    <Image
      className="w-full h-fll object-cover"
      alt="no builders yet"
      src="/images/joining-without-text.png"
      width={1200}
      height={600}
      priority
    />
    <Typography
      tagVariant="h1"
      className="uppercase font-kk-topo text-[48px] leading-tight font-normal absolute inset-0 flex items-center justify-center tracking-[-0.96px]"
    >
      Builders are joining soon...
    </Typography>
  </div>
)

export const BuildersLeaderBoardContent = () => {
  // TODO: check where to store this information
  const tokens = {
    rif: {
      address: getAddress(tokenContracts.RIF),
      symbol: 'RIF',
    },
    rbtc: {
      address: COINBASE_ADDRESS,
      symbol: 'RBTC',
    },
  }

  const { data: rewardsData, isLoading, error } = useGetBuildersRewards(tokens)
  useHandleErrors({ error, title: 'Error loading builder rewards' })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!rewardsData || rewardsData.length === 0) {
    return <EmptyLeaderboard />
  }

  return (
    <SearchContextProvider builders={rewardsData}>
      <Search />
      <BuildersLeaderBoardTable />
    </SearchContextProvider>
  )
}
