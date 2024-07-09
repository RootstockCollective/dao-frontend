import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { useModal } from '@/app/user/Balances/hooks/useModal'
import { Hash } from 'viem'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  prices: GetPricesResult
  stakeModal: ReturnType<typeof useModal>
  unstakeModal: ReturnType<typeof useModal>
  stakeModalData?: {
    savedAllowanceTxHash?: Hash
  }
  onUpdateStakeModalData?: (prop: string, value: string | Hash) => void
}

const DEFAULT_STAKE_MODAL_PROPERTIES = {
  isModalOpened: false,
  openModal: () => {},
  closeModal: () => {},
  toggleModal: () => {},
}
export const BalancesContext = createContext<BalancesContextValue>({
  balances: {},
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

  const [stakeModalData, setStakeModalData] = useState({})

  const onUpdateStakeModalData = useCallback((field: string, value: string | Hash) => {
    setStakeModalData(prevState => ({ ...prevState, [field]: value }))
  }, [])

  const valueOfContext = useMemo(
    () => ({
      balances,
      prices,
      stakeModal,
      unstakeModal,
      stakeModalData,
      onUpdateStakeModalData,
    }),
    [balances, prices, stakeModal, unstakeModal, stakeModalData, onUpdateStakeModalData],
  )

  return <BalancesContext.Provider value={valueOfContext}>{children}</BalancesContext.Provider>
}

export const useBalancesContext = () => useContext(BalancesContext)
