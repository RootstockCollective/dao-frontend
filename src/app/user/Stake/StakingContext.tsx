import { StakingToken, TokenWithBalance } from '@/app/user/Stake/types'
import Big from '@/lib/big'
import { RIF, STRIF, TokenSymbol } from '@/lib/tokens'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

interface StakePreviewToken {
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenSymbol: TokenSymbol
}

interface ButtonAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  isTxPending?: boolean
}

interface ButtonActions {
  primary: ButtonAction
  secondary?: ButtonAction
}

export interface StakingContextProps {
  amount: string
  onAmountChange: (amount: string) => void
  tokenToSend: TokenWithBalance
  tokenToReceive: StakingToken
  stakePreviewFrom: StakePreviewToken
  stakePreviewTo: StakePreviewToken

  // Button action management
  buttonActions: ButtonActions
  setButtonActions: (actions: ButtonActions) => void
}

const DEFAULT_STAKE_PREVIEW_TOKEN = {
  amount: '0',
  balance: '0',
  tokenSymbol: RIF,
  amountConvertedToCurrency: formatCurrencyWithLabel(0),
}

const DEFAULT_BUTTON_ACTIONS: ButtonActions = {
  primary: {
    label: 'Continue',
    onClick: () => {},
    disabled: false,
    loading: false,
    isTxPending: false,
  },
}

const StakingContext = createContext<StakingContextProps>({
  amount: '0',
  onAmountChange: () => {},
  tokenToSend: { balance: '', symbol: RIF, price: '', contract: '0x0' },
  tokenToReceive: { balance: '', symbol: STRIF, price: '', contract: '0x0' },
  stakePreviewFrom: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
  stakePreviewTo: { ...DEFAULT_STAKE_PREVIEW_TOKEN },
  buttonActions: DEFAULT_BUTTON_ACTIONS,
  setButtonActions: () => {},
})

interface Props {
  children: ReactNode
  tokenToSend: TokenWithBalance
  tokenToReceive: StakingToken
}

export const StakingProvider: FC<Props> = ({ tokenToSend, tokenToReceive, children }) => {
  const [stakeData, setStakeData] = useState({ amount: '' })
  const [buttonActions, setButtonActions] = useState<ButtonActions>(DEFAULT_BUTTON_ACTIONS)

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
        amountConvertedToCurrency: formatCurrencyWithLabel(0),
        balance: tokenToReceive.balance,
        tokenSymbol: tokenToReceive.symbol,
      }
    }
    const stakeAmount = Big(stakeData.amount || 0)
    const amountToReceive = stakeAmount.mul(sendTokenPrice).div(receiveTokenPrice)
    const amountToReceiveConvertedToCurrency = amountToReceive.mul(receiveTokenPrice)
    return {
      amount: amountToReceive.toString(),
      amountConvertedToCurrency: formatCurrencyWithLabel(amountToReceiveConvertedToCurrency),
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
      amountConvertedToCurrency: formatCurrencyWithLabel(
        Big(tokenToSend.price || 0).mul(Big(stakeData.amount || 0)),
      ),
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
      buttonActions,
      setButtonActions,
    }),
    [stakeData.amount, tokenToSend, tokenToReceive, stakePreviewFrom, stakePreviewTo, buttonActions],
  )

  return <StakingContext.Provider value={data}>{children}</StakingContext.Provider>
}

export const useStakingContext = () => useContext(StakingContext)
