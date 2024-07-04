import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { getActualUsedSymbol } from '@/app/user/Balances/balanceUtils'

interface StakingContextProps {
  balances: TokenBalanceRecord
  prices: GetPricesResult
  amount: string
  onAmountChange: (amount: string) => void
  symbolUsed: string
}

const StakingContext = createContext<StakingContextProps>({
  balances: {},
  prices: {},
  amount: '0',
  onAmountChange: () => {},
  symbolUsed: '',
})

interface Props {
  children: ReactNode
}

export const StakingProvider: FC<Props> = ({ children }) => {
  const { balances, prices } = useBalancesContext()
  const [stakeData, setStakeData] = useState({
    amount: '',
  })

  const onAmountChange = useCallback(
    (amount: string) => setStakeData(prevState => ({ ...prevState, amount })),
    [],
  )

  const symbolUsed = useMemo(() => getActualUsedSymbol('RIF', balances), [balances])

  const data = useMemo(
    () => ({
      balances,
      prices,
      amount: stakeData.amount,
      onAmountChange,
      symbolUsed,
    }),
    [balances, prices, stakeData.amount, onAmountChange, symbolUsed],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
