import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetBuilders } from '@/app/collective-rewards/user'
import { withPricesContextProvider } from '@/shared/context/PricesContext'
import { createContext, FC, ReactNode, useCallback, useContext, useMemo } from 'react'
import { Address } from 'viem'

type BuilderContextValue = {
  data: Builder[]
  isLoading: boolean
  error: Error | null
  getBuilderByAddress: (address: Address) => Builder | undefined
}

export const BuilderContext = createContext<BuilderContextValue>({
  data: [],
  isLoading: false,
  error: null,
  getBuilderByAddress: () => ({}) as Builder,
})

interface BuilderProviderProps {
  children: ReactNode
}

export const BuilderContextProvider: FC<BuilderProviderProps> = ({ children }) => {
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useGetBuilders()

  const isLoading = buildersLoading
  const error = buildersError

  const getBuilderByAddress = useCallback(
    (address: Address): Builder | undefined => builders[address],
    [builders],
  )

  const valueOfContext: BuilderContextValue = useMemo(
    () => ({
      data: Object.values(builders),
      isLoading,
      error,
      getBuilderByAddress,
    }),
    [builders, isLoading, error, getBuilderByAddress],
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
