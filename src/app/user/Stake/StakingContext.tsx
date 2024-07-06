import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { StakingToken } from '@/app/user/Stake/types'
import { Hash } from 'viem'

export type ActionHookToUse = (
  amount: string,
  tokenToSendContract: string,
  tokenToReceiveContract: string,
) => {
  shouldEnableConfirm: boolean
  onConfirm: () => Promise<Hash>
  customFooter: ReactNode
}

interface StakingContextProps {
  balances: TokenBalanceRecord
  prices: GetPricesResult
  amount: string
  onAmountChange: (amount: string) => void
  stakeTxHash?: string
  setStakeTxHash?: (txHash: string) => void
  tokenToSend: StakingToken
  tokenToReceive: StakingToken
  amountDataToReceive: {
    amountToReceive: string
    amountToReceiveConvertedToCurrency: string
  }
  actionToUse: ActionHookToUse
}

const StakingContext = createContext<StakingContextProps>({
  balances: {},
  prices: {},
  amount: '0',
  onAmountChange: () => {},
  stakeTxHash: '',
  tokenToSend: { balance: '', symbol: '', price: '', contract: '' },
  tokenToReceive: { balance: '', symbol: '', price: '', contract: '' },
  amountDataToReceive: {
    amountToReceive: '',
    amountToReceiveConvertedToCurrency: '',
  },
  actionToUse: () => ({ shouldEnableConfirm: false, onConfirm: async () => '0x0', customFooter: null }),
})

interface Props {
  children: ReactNode
  tokenToSend: StakingToken
  tokenToReceive: StakingToken
  actionToUse: ActionHookToUse
}

export const StakingProvider: FC<Props> = ({ tokenToSend, tokenToReceive, actionToUse, children }) => {
  const { balances, prices } = useBalancesContext()
  const [stakeData, setStakeData] = useState({
    amount: '',
  })

  const onAmountChange = useCallback(
    (amount: string) => setStakeData(prevState => ({ ...prevState, amount })),
    [],
  )

  const [stakeTxHash, setStakeTxHash] = useState('')

  const amountDataToReceive = useMemo(() => {
    const amountToReceive =
      (Number(stakeData.amount) * Number(tokenToSend.price)) / Number(tokenToReceive.price)
    const amountToReceiveConvertedToCurrency = amountToReceive * Number(tokenToReceive.price) || 0
    return {
      amountToReceive: amountToReceive.toString(),
      amountToReceiveConvertedToCurrency: amountToReceiveConvertedToCurrency.toString(),
    }
  }, [stakeData.amount, tokenToSend.price, tokenToReceive.price])

  const data = useMemo(
    () => ({
      balances,
      prices,
      amount: stakeData.amount,
      onAmountChange,
      stakeTxHash,
      setStakeTxHash,
      tokenToSend,
      tokenToReceive,
      amountDataToReceive,
      actionToUse,
    }),
    [
      balances,
      prices,
      stakeData.amount,
      onAmountChange,
      stakeTxHash,
      tokenToSend,
      tokenToReceive,
      amountDataToReceive,
      actionToUse,
    ],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
