import { useShuffledArray } from '@/app/backing/hooks/useShuffledArray'
import { Builder } from '@/app/collective-rewards/types'
import { useGetBuilders } from '@/app/collective-rewards/user'
import { withPricesContextProvider } from '@/shared/context/PricesContext'
import { createContext, FC, ReactNode, useCallback, useContext, useMemo } from 'react'
import { Address } from 'viem'
import { isBuilderRewardable } from '../../utils'

const SPOTLIGHT_BUILDERS = 4

type BuilderContextValue = {
  builders: Builder[]
  randomBuilders: Builder[]
  isLoading: boolean
  error: Error | null
  getBuilderByAddress: (address: Address) => Builder | undefined
}

export const BuilderContext = createContext<BuilderContextValue>({
  builders: [],
  randomBuilders: [],
  isLoading: false,
  error: null,
  getBuilderByAddress: () => ({}) as Builder,
})

interface BuilderProviderProps {
  children: ReactNode
}

export const BuilderContextProvider: FC<BuilderProviderProps> = ({ children }) => {
  const { data: buildersMap, isLoading, error } = useGetBuilders()

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

export const withBuilderContextProvider = <P extends object>(Component: FC<P>) => {
  return function WrapperComponent(props: P) {
    return (
      <BuilderContextProvider>
        <Component {...props} />
      </BuilderContextProvider>
    )
  }
}

export const BuilderContextProviderWithPrices = withPricesContextProvider(BuilderContextProvider)
