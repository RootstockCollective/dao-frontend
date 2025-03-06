'use client'
import { AVERAGE_BLOCKTIME, NFT_BOOSTER_DATA_URL } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

interface HolderRewards {
  estimatedRBTCRewards: bigint
  estimatedRIFRewards: bigint
  boostedRBTCRewards: bigint
  boostedRIFRewards: bigint
}

interface Holders {
  [holderAddress: string]: HolderRewards
}

export interface BoostData {
  nftContractAddress: Address
  boostPercentage: bigint
  calculationBlock: bigint
  timestamp: bigint
  holders: Holders
}
interface NFTBoosterContext {
  boostData?: BoostData
  isLoading?: boolean
  error?: Error | null
  currentBoost?: HolderRewards
  hasActiveCampaign?: boolean
  isBoosted?: boolean
}

const BoosterContext = createContext<NFTBoosterContext>({
  boostData: {} as BoostData,
})

interface BoosterContextProviderProps {
  children: ReactNode
}
export const BoosterProvider = ({ children }: BoosterContextProviderProps) => {
  const { address } = useAccount()
  const { data: boostData, isLoading, error, hasActiveCampaign } = useFetchBoostData()

  const value = useMemo(() => {
    if (!boostData && !isLoading && !error) {
      return {}
    }

    if (!address) {
      return { boostData, isLoading, error, hasActiveCampaign }
    }

    const addressInLowerCase = address.toLocaleLowerCase()
    const [, currentBoostRaw] =
      Object.entries(boostData?.holders ?? {}).find(
        ([key]) => key.toLocaleLowerCase() === addressInLowerCase,
      ) ?? []

    if (!currentBoostRaw) {
      return { isBoosted: false, boostData, isLoading, error, hasActiveCampaign }
    }

    const { boostedRBTCRewards, boostedRIFRewards, estimatedRBTCRewards, estimatedRIFRewards } =
      currentBoostRaw
    // > ![NOTE]
    // > This is to provide a runtime safeguard, as the data is not guaranteed to be present or to be of the correct type
    const currentBoost = {
      boostedRBTCRewards: BigInt(boostedRBTCRewards ?? 0),
      boostedRIFRewards: BigInt(boostedRIFRewards ?? 0),
      estimatedRBTCRewards: BigInt(estimatedRBTCRewards ?? 0),
      estimatedRIFRewards: BigInt(estimatedRIFRewards ?? 0),
    }
    const isBoosted = !!(
      currentBoost.boostedRBTCRewards ||
      currentBoost.boostedRIFRewards ||
      currentBoost.estimatedRBTCRewards ||
      currentBoost.estimatedRIFRewards
    )

    return { boostData, isLoading, error, currentBoost, hasActiveCampaign, isBoosted }
  }, [boostData, address, isLoading, error, hasActiveCampaign])
  return <BoosterContext.Provider value={value}>{children}</BoosterContext.Provider>
}

export const useNFTBoosterContext = () => useContext(BoosterContext)

export const axiosInstance = axios.create()

export const useFetchBoostData = () => {
  const {
    data: latestFile,
    isLoading: isFileDataLoading,
    error: fileDataError,
  } = useQuery<string>({
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${NFT_BOOSTER_DATA_URL}/latest`)

      return data
    },
    queryKey: ['nftBoosterLatestFile'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })
  const hasActiveCampaign = !!latestFile && latestFile !== 'None'

  const {
    data: boostData,
    isLoading: isBoostDataLoading,
    error: boostDataError,
  } = useQuery<BoostData>({
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${NFT_BOOSTER_DATA_URL}/${latestFile}`)

      return data
    },
    queryKey: ['nftBoosterData'],
    refetchInterval: AVERAGE_BLOCKTIME,
    enabled: hasActiveCampaign,
  })

  return {
    data: boostData,
    isLoading: isFileDataLoading || isBoostDataLoading,
    error: fileDataError || boostDataError,
    hasActiveCampaign,
  }
}
