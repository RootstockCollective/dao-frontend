import { executeTxFlow } from '@/shared/notification'
import { useEffect } from 'react'
import { SwapStepProps, ButtonActions } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Address } from 'viem'

// Temporary type - should match SwappingContext interface
interface SwappingContextValue {
  amount: string
  tokenToReceive: {
    balance: string
    symbol: string
    price?: string
    contract: Address
  }
  swapPreviewFrom: {
    amount: string
    amountConvertedToCurrency: string
    balance: string
    tokenSymbol: string
  }
  swapPreviewTo: {
    amount: string
    amountConvertedToCurrency: string
    balance: string
    tokenSymbol: string
  }
  setButtonActions: (actions: ButtonActions) => void
}

// TODO: Import and use useSwappingContext when SwappingProvider is merged from dao-1767
// import { useSwappingContext } from '@/shared/context/SwappingContext'

// Temporary hook - will be replaced with actual swap hook
const useSwapTokens = (amount: string, tokenToSendContract: Address, tokenToReceiveContract: Address) => {
  return {
    onRequestSwap: () => {},
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    swapTxHash: undefined as string | undefined,
  }
}

export const SwapStepThree = ({ onGoToStep, onCloseModal, setButtonActions }: SwapStepProps) => {
  // TODO: Replace with actual useSwappingContext when SwappingProvider is merged
  // const {
  //   amount,
  //   tokenToReceive,
  //   swapPreviewFrom: from,
  //   swapPreviewTo: to,
  //   setButtonActions,
  // } = useSwappingContext()

  // Temporary placeholder - remove when SwappingProvider is available
  const amount = ''
  const tokenToReceive = { balance: '0', symbol: 'USDRIF', price: '1', contract: '0x0' as Address }
  const from = {
    amount: '0',
    amountConvertedToCurrency: '$0.00',
    balance: '0',
    tokenSymbol: 'USDT0',
  }
  const to = {
    amount: '0',
    amountConvertedToCurrency: '$0.00',
    balance: '0',
    tokenSymbol: 'USDRIF',
  }

  // TODO: Replace with actual swap hook when available
  const { onRequestSwap, isRequesting, isTxPending, isTxFailed, swapTxHash } = useSwapTokens(
    amount,
    '0x0' as Address, // tokenToSend contract
    tokenToReceive.contract,
  )

  // Set button actions
  // TODO: Re-enable actual swap logic when functionality is wired
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Confirm swap',
        onClick: onCloseModal, // Temporarily close modal for demo - will execute swap when wired
        disabled: false, // Temporarily disabled for UI demo
        loading: false,
        isTxPending: false,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0), // Go back to Step One
        disabled: false,
        loading: false,
      },
    })
  }, [onCloseModal, onGoToStep, setButtonActions])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <StakeTokenAmountDisplay
          label="From"
          amount={from.amount}
          tokenSymbol={from.tokenSymbol}
          amountInCurrency={from.amountConvertedToCurrency}
          balance={from.balance}
        />
        <StakeTokenAmountDisplay
          label="To"
          amount={to.amount}
          tokenSymbol={to.tokenSymbol}
          amountInCurrency={to.amountConvertedToCurrency}
          balance={to.balance}
          isFlexEnd
        />
      </div>

      <TransactionStatus txHash={swapTxHash} isTxFailed={isTxFailed} failureMessage="Swap TX failed." />
    </>
  )
}
