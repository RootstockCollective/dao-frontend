import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import Decimal from 'decimal.js'
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
  isAllowanceEnough: boolean
  onConfirm: () => Promise<Hash>
  customFooter: ReactNode
  isPending: boolean
  isAllowanceReadLoading?: boolean
  onRequestAllowance?: () => Promise<Hash>
  isRequestingAllowance?: boolean
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
  actionToUse: () => ({
    isAllowanceEnough: false,
    onConfirm: async () => '0x0',
    customFooter: null,
    isPending: false,
    isAllowanceReadLoading: false,
    onRequestAllowance: async () => '0x0',
  }),
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
    const receiveTokenPrice = new Decimal(tokenToReceive.price || 0)
    const sendTokenPrice = new Decimal(tokenToSend.price || 0)
    if (receiveTokenPrice.eq(0) || sendTokenPrice.eq(0)) {
      return {
        amountToReceive: '0',
        amountToReceiveConvertedToCurrency: 'USD 0',
      }
    }
    const stakeAmount = new Decimal(stakeData.amount || 0)
    const amountToReceive = stakeAmount.mul(sendTokenPrice).div(receiveTokenPrice)
    const amountToReceiveConvertedToCurrency = amountToReceive.mul(receiveTokenPrice)
    return {
      amountToReceive: amountToReceive.toString(),
      amountToReceiveConvertedToCurrency: `USD ${formatCurrency(amountToReceiveConvertedToCurrency.toNumber())}`,
    }
  }, [stakeData.amount, tokenToSend.price, tokenToReceive.price])

  const stakePreviewFrom = useMemo(
    () => ({
      amount: toFixed(stakeData.amount),
      amountConvertedToCurrency:
        'USD ' + formatCurrency(Number(tokenToSend.price) * Number(stakeData.amount) || 0),
      balance: tokenToSend.balance,
      tokenSymbol: tokenToSend.symbol,
    }),
    [stakeData.amount, tokenToSend.balance, tokenToSend.price, tokenToSend.symbol],
  )

  const stakePreviewTo = useMemo(
    () => ({
      amount: toFixed(amountDataToReceive.amountToReceive),
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
