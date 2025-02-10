import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { RBTC, RIF, stRIF } from '@/lib/constants'
import { getTokenBalance } from '../balanceUtils'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  prices: GetPricesResult
  stakeModal: ReturnType<typeof useModal>
  unstakeModal: ReturnType<typeof useModal>
}

const DEFAULT_STAKE_MODAL_PROPERTIES = {
  isModalOpened: false,
  openModal: () => {},
  closeModal: () => {},
  toggleModal: () => {},
}
export const BalancesContext = createContext<BalancesContextValue>({
  balances: {
    [RBTC]: getTokenBalance(RBTC),
    [RIF]: getTokenBalance(RIF),
    [stRIF]: getTokenBalance(stRIF),
  },
  prices: {},
  stakeModal: { ...DEFAULT_STAKE_MODAL_PROPERTIES },
  unstakeModal: { ...DEFAULT_STAKE_MODAL_PROPERTIES },
})

interface BalancesProviderProps {
  children: ReactNode
}

export const BalancesProvider: FC<BalancesProviderProps> = ({ children }) => {
  const balances = useGetAddressBalances()
  const prices = useGetSpecificPrices()

  const stakeModal = useModal()
  const unstakeModal = useModal()

  const valueOfContext = useMemo(
    () => ({
      balances,
      prices,
      stakeModal,
      unstakeModal,
    }),
    [balances, prices, stakeModal, unstakeModal],
  )

  return <BalancesContext.Provider value={valueOfContext}>{children}</BalancesContext.Provider>
}

export const useBalancesContext = () => useContext(BalancesContext)
