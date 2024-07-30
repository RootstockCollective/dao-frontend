import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { StakingToken } from '@/app/user/Stake/types'
import { Hash } from 'viem'
import { ActionBeingExecuted } from '@/app/user/Stake/Steps/stepsUtils'
import { formatCurrency, toFixed } from '@/lib/utils'

export type ActionHookToUse = (
  amount: string,
  tokenToSendContract: string,
  tokenToReceiveContract: string,
) => {
  shouldEnableConfirm: boolean
  onConfirm: () => Promise<Hash>
  customFooter: ReactNode
}

type StakePreviewToken = {
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenSymbol: string
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
  actionName: ActionBeingExecuted
  stakePreviewFrom: StakePreviewToken
  stakePreviewTo: StakePreviewToken
}

const DEFAULT_STAKE_PREVIEW_TOKEN = {
  amount: '0',
  balance: '0',
  tokenSymbol: '0',
  amountConvertedToCurrency: formatCurrency(0),
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
  actionName: 'STAKE',
  stakePreviewFrom: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
  stakePreviewTo: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
})

interface Props {
  children: ReactNode
  tokenToSend: StakingToken
  tokenToReceive: StakingToken
  actionToUse: ActionHookToUse
  actionName: ActionBeingExecuted
}

export const StakingProvider: FC<Props> = ({
  tokenToSend,
  tokenToReceive,
  actionToUse,
  children,
  actionName,
}) => {
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
      amountToReceiveConvertedToCurrency: `USD ${formatCurrency(amountToReceiveConvertedToCurrency)}`,
    }
  }, [stakeData.amount, tokenToSend.price, tokenToReceive.price])

  const stakePreviewFrom = useMemo(
    () => ({
      amount: toFixed(Number(stakeData.amount)),
      amountConvertedToCurrency:
        'USD ' + formatCurrency(Number(tokenToSend.price) * Number(stakeData.amount) ?? 0),
      balance: tokenToSend.balance,
      tokenSymbol: tokenToSend.symbol,
    }),
    [stakeData.amount, tokenToSend.balance, tokenToSend.price, tokenToSend.symbol],
  )

  const stakePreviewTo = useMemo(
    () => ({
      amount: toFixed(Number(amountDataToReceive.amountToReceive)),
      amountConvertedToCurrency: amountDataToReceive.amountToReceiveConvertedToCurrency,
      balance: tokenToReceive.balance,
      tokenSymbol: tokenToReceive.symbol,
    }),
    [
      amountDataToReceive.amountToReceive,
      amountDataToReceive.amountToReceiveConvertedToCurrency,
      tokenToReceive.balance,
      tokenToReceive.symbol,
    ],
  )

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
      actionName,
      stakePreviewFrom,
      stakePreviewTo,
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
      actionName,
      stakePreviewFrom,
      stakePreviewTo,
    ],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
