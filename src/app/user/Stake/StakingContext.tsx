import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'

interface StakingContextProps {
  balances: TokenBalanceRecord
  prices: GetPricesResult
  amount: string
  onAmountChange: (amount: string) => void
}

const StakingContext = createContext<StakingContextProps>({
  balances: {},
  prices: {},
  amount: '0',
  onAmountChange: () => {},
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

  const data = useMemo(
    () => ({
      balances,
      prices,
      amount: stakeData.amount,
      onAmountChange,
    }),
    [balances, prices, stakeData.amount, onAmountChange],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
