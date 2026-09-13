import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react'
import { Address } from 'viem'

import { useShuffledArray } from '@/app/backing/hooks/useShuffledArray'
import { Builder } from '@/app/collective-rewards/types'
import { useGetBuilderProfiles, useGetBuilders } from '@/app/collective-rewards/user'
import { withPricesContextProvider } from '@/shared/context/PricesContext'

import { isBuilderRewardable } from '../../utils'

const SPOTLIGHT_BUILDERS = 4

interface BuilderContextValue {
  builders: Builder[]
  randomBuilders: Builder[]
  isLoading: boolean
  error: Error | null
  getBuilderByAddress: (address: Address) => Builder | undefined
}

const BuilderContext = createContext<BuilderContextValue>({
  builders: [],
  randomBuilders: [],
  isLoading: false,
  error: null,
  getBuilderByAddress: () => ({}) as Builder,
})

interface BuilderProviderProps {
  children: ReactNode
}

const BuilderContextProvider = ({ children }: BuilderProviderProps) => {
  const { data: onChainBuildersMap, isLoading, error } = useGetBuilders()
  const { data: profiles } = useGetBuilderProfiles()

  /**
   * The on-chain builder data and the curated profiles come from two different
   * databases behind two different connections, so they are merged here rather
   * than joined in SQL. The profiles request resolves long before the chain reads
   * do, and while it is in flight builders simply render without a curated icon.
   * Profiles are keyed by lowercased address; the on-chain map is checksummed.
   */
  const buildersMap = useMemo(() => {
    if (!Object.keys(profiles).length) return onChainBuildersMap

    return Object.entries(onChainBuildersMap).reduce<Record<Address, Builder>>((acc, [address, builder]) => {
      acc[address as Address] = { ...builder, image: profiles[address.toLowerCase()]?.image ?? null }
      return acc
    }, {})
  }, [onChainBuildersMap, profiles])

  const builders = useMemo(() => Object.values(buildersMap), [buildersMap])

  // FIXME: randomBuilders need to be stored in the session storage
  const randomBuilders = useShuffledArray<Builder>(builders)
    .filter(({ stateFlags }) => isBuilderRewardable(stateFlags))
    .slice(0, SPOTLIGHT_BUILDERS)

  const getBuilderByAddress = useCallback(
    (address: Address): Builder | undefined => buildersMap[address],
    [buildersMap],
  )

  const valueOfContext: BuilderContextValue = useMemo(
    () => ({
      builders,
      randomBuilders,
      isLoading,
      error,
      getBuilderByAddress,
    }),
    [builders, isLoading, error, getBuilderByAddress, randomBuilders],
  )

  return <BuilderContext.Provider value={valueOfContext}>{children}</BuilderContext.Provider>
}

export const useBuilderContext = () => useContext(BuilderContext)

export const BuilderContextProviderWithPrices = withPricesContextProvider(BuilderContextProvider)
