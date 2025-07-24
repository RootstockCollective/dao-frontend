import { StakingToken } from '@/app/my-holdings/sections/Stake/types'
import Big from '@/lib/big'
import { formatCurrency } from '@/lib/utils'
import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

type StakePreviewToken = {
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenSymbol: string
}

interface StakingContextProps {
  amount: string
  onAmountChange: (amount: string) => void
  tokenToSend: StakingToken
  tokenToReceive: StakingToken
  stakePreviewFrom: StakePreviewToken
  stakePreviewTo: StakePreviewToken
}

const DEFAULT_STAKE_PREVIEW_TOKEN = {
  amount: '0',
  balance: '0',
  tokenSymbol: '0',
  amountConvertedToCurrency: formatCurrency(0, { showCurrency: true }),
}

const StakingContext = createContext<StakingContextProps>({
  amount: '0',
  onAmountChange: () => {},
  tokenToSend: { balance: '', symbol: '', price: '', contract: '0x0' },
  tokenToReceive: { balance: '', symbol: '', price: '', contract: '0x0' },
  stakePreviewFrom: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
  stakePreviewTo: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
})

interface Props {
  children: ReactNode
  tokenToSend: StakingToken
  tokenToReceive: StakingToken
}

export const StakingProvider: FC<Props> = ({ tokenToSend, tokenToReceive, children }) => {
  const [stakeData, setStakeData] = useState({ amount: '' })

  const onAmountChange = useCallback((amount: string) => {
    if (amount !== '.') {
      setStakeData(prev => ({ ...prev, amount }))
    }
  }, [])

  const stakePreviewTo = useMemo(() => {
    const receiveTokenPrice = Big(tokenToReceive.price || 0)
    const sendTokenPrice = Big(tokenToSend.price || 0)
    if (receiveTokenPrice.eq(0) || sendTokenPrice.eq(0)) {
      return {
        amount: '0',
        amountConvertedToCurrency: formatCurrency(0, { showCurrency: true }),
        balance: tokenToReceive.balance,
        tokenSymbol: tokenToReceive.symbol,
      }
    }
    const stakeAmount = Big(stakeData.amount || 0)
    const amountToReceive = stakeAmount.mul(sendTokenPrice).div(receiveTokenPrice)
    const amountToReceiveConvertedToCurrency = amountToReceive.mul(receiveTokenPrice)
    return {
      amount: amountToReceive.toString(),
      amountConvertedToCurrency: formatCurrency(amountToReceiveConvertedToCurrency, {
        showCurrency: true,
      }),
      balance: tokenToReceive.balance,
      tokenSymbol: tokenToReceive.symbol,
    }
  }, [
    stakeData.amount,
    tokenToSend.price,
    tokenToReceive.price,
    tokenToReceive.balance,
    tokenToReceive.symbol,
  ])

  const stakePreviewFrom = useMemo(
    () => ({
      amount: Big(stakeData.amount || 0).toFixedNoTrailing(8),
      amountConvertedToCurrency: formatCurrency(Big(tokenToSend.price || 0).mul(Big(stakeData.amount || 0)), {
        showCurrency: true,
      }),
      balance: tokenToSend.balance,
      tokenSymbol: tokenToSend.symbol,
    }),
    [stakeData.amount, tokenToSend.balance, tokenToSend.price, tokenToSend.symbol],
  )

  const data = useMemo(
    () => ({
      amount: stakeData.amount,
      onAmountChange,
      tokenToSend,
      tokenToReceive,
      stakePreviewFrom,
      stakePreviewTo,
    }),
    [stakeData.amount, onAmountChange, tokenToSend, tokenToReceive, stakePreviewFrom, stakePreviewTo],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
