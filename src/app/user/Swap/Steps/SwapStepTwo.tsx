import { Header, Label } from '@/components/Typography'
import { useEffect } from 'react'
import { SwapStepProps, ButtonActions } from '../types'
import { StakeTokenAmountDisplay } from '@/app/user/Stake/components/StakeTokenAmountDisplay'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Address } from 'viem'

// Temporary type - should match SwappingContext interface
interface SwappingContextValue {
  amount: string
  tokenToSend: {
    balance: string
    symbol: string
    contract: Address
    price?: string
  }
  tokenToReceive: {
    balance: string
    symbol: string
    contract: Address
    price?: string
  }
  swapPreviewFrom: {
    amount: string
    amountConvertedToCurrency: string
    balance: string
    tokenSymbol: string
  }
  setButtonActions: (actions: ButtonActions) => void
}

// TODO: Import and use useSwappingContext when SwappingProvider is merged from dao-1767
// import { useSwappingContext } from '@/shared/context/SwappingContext'

export const SwapStepTwo = ({ onGoNext, onGoBack, setButtonActions }: SwapStepProps) => {
  // TODO: Replace with actual useSwappingContext when SwappingProvider is merged
  // const {
  //   amount,
  //   tokenToSend,
  //   tokenToReceive,
  //   swapPreviewFrom: from,
  //   setButtonActions,
  // } = useSwappingContext()

  // Temporary placeholder - remove when SwappingProvider is available
  const amount = '0' // Use '0' instead of '' to avoid Big.js errors in useAllowance
  const tokenToSend = { balance: '0', symbol: 'USDT0', price: '1', contract: '0x0' as Address }
  const tokenToReceive = { balance: '0', symbol: 'USDRIF', price: '1', contract: '0x0' as Address }
  const from = {
    amount: '0',
    amountConvertedToCurrency: '$0.00',
    balance: '0',
    tokenSymbol: 'USDT0',
  }

  // TODO: Re-enable useAllowance when functionality is wired - for now using placeholder values
  // Note: For USDT0 (6 decimals), we need to use parseUnits with 6 decimals instead of parseEther
  // This will need to be adjusted based on the actual token decimals
  // const {
  //   isAllowanceEnough,
  //   isAllowanceReadLoading,
  //   onRequestAllowance,
  //   isRequesting,
  //   isTxPending,
  //   isTxFailed,
  //   allowanceTxHash,
  // } = useAllowance(amount, tokenToSend.contract, tokenToReceive.contract)

  // Placeholder values for UI demo
  const isAllowanceEnough = false
  const isAllowanceReadLoading = false
  const isRequesting = false
  const isTxPending = false
  const isTxFailed = false
  const allowanceTxHash = undefined as string | undefined

  // Set button actions
  // TODO: Re-enable validation and actual allowance logic when functionality is wired
  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Request allowance',
        onClick: onGoNext, // Temporarily use onGoNext for demo - will be: handleRequestAllowance
        disabled: false, // Temporarily disabled for UI demo
        loading: false,
        isTxPending: false,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: false,
        loading: false,
      },
    })
  }, [onGoNext, onGoBack, setButtonActions])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenToSend.symbol} smart contract</Header>
          </div>
        </div>
        <StakeTokenAmountDisplay
          label="Allowance amount"
          amount={amount}
          tokenSymbol={tokenToSend.symbol}
          amountInCurrency={from.amountConvertedToCurrency}
          isFlexEnd
        />
      </div>

      <TransactionStatus
        txHash={allowanceTxHash}
        isTxFailed={isTxFailed}
        failureMessage="Allowance TX failed."
      />
    </>
  )
}
