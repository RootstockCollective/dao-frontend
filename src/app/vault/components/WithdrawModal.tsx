import { Modal } from '@/components/Modal'
import { Header, Label } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, handleAmountInput, formatCurrency } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useWithdrawFromVault } from '../hooks/useWithdrawFromVault'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Divider } from '@/components/Divider'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { VaultInput } from './VaultInput'
import { TokenImage } from '@/components/TokenImage'
import { PercentageButtons } from '@/app/user/Unstake/components/PercentageButtons'
import { formatEther } from 'viem'
import { usePricesContext } from '@/shared/context'

interface Props {
  onCloseModal: () => void
}

export const WithdrawModal = ({ onCloseModal }: Props) => {
  const { prices } = usePricesContext()

  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const {
    userUsdrifBalance,
    formattedUserUsdrifBalance,
    isLoading: isVaultBalanceLoading,
  } = useVaultBalance()

  const { onRequestWithdraw, isRequesting, isTxPending, isTxFailed, withdrawTxHash } =
    useWithdrawFromVault(amount)

  const userUsdrifBalanceString = useMemo(() => {
    return formatEther(userUsdrifBalance)
  }, [userUsdrifBalance])

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    const rawBalance = Big(userUsdrifBalanceString)
    return rawAmount.gt(rawBalance)
  }, [amount, userUsdrifBalanceString])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than your available USDRIF balance. Please update the amount.'
    }
    return ''
  }, [isAmountOverBalance])

  const cannotProceedWithWithdraw = useMemo(
    () => !amount || !Big(amount).gt(0) || isAmountOverBalance || isRequesting || isVaultBalanceLoading,
    [amount, isAmountOverBalance, isRequesting, isVaultBalanceLoading],
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const calculatedAmount = Big(userUsdrifBalanceString).mul(percentage).toString()
      setAmount(calculatedAmount)
    },
    [userUsdrifBalanceString],
  )

  const handleConfirmWithdraw = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestWithdraw,
      onSuccess: onCloseModal,
      action: 'vaultWithdraw',
    })
  }, [onRequestWithdraw, onCloseModal])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // For now, no price data for USDRIF - can be added later
  const amountToCurrency = formatCurrency(Big(prices['USDRIF']?.price || 0).mul(amount || 0))

  return (
    <Modal width={688} onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
        <Header className="mt-16 mb-4">WITHDRAW USDRIF</Header>

        <div className="flex-1">
          <VaultInput
            ref={inputRef}
            value={amount}
            onChange={handleAmountChange}
            symbol="USDRIF"
            labelText="Amount to withdraw"
            currencyValue={amountToCurrency}
            errorText={errorMessage}
          />

          <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
            <div className="flex items-center gap-1">
              <TokenImage symbol="USDRIF" size={12} />
              <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
                USDRIF deposited in vault: {formattedUserUsdrifBalance}
              </Label>
            </div>
            <div className="flex gap-1 self-end">
              <PercentageButtons onPercentageClick={handlePercentageClick} />
            </div>
          </div>

          <TransactionStatus
            txHash={withdrawTxHash}
            isTxFailed={isTxFailed}
            failureMessage="Withdraw TX failed."
            className="mt-8"
          />
        </div>

        <Divider className="mb-4 mt-6" />

        <WithdrawActions
          isTxPending={isTxPending}
          isRequesting={isRequesting}
          cannotProceed={cannotProceedWithWithdraw}
          onWithdraw={handleConfirmWithdraw}
        />
      </div>
    </Modal>
  )
}

interface WithdrawActionsProps {
  isTxPending: boolean
  isRequesting: boolean
  cannotProceed: boolean
  onWithdraw: () => void
}

const WithdrawActions = ({ isTxPending, isRequesting, cannotProceed, onWithdraw }: WithdrawActionsProps) => {
  if (isTxPending) {
    return <TransactionInProgressButton />
  }

  return (
    <div className="flex justify-end">
      <Button variant="primary" onClick={onWithdraw} disabled={cannotProceed} data-testid="WithdrawButton">
        {isRequesting ? 'Requesting...' : 'Withdraw'}
      </Button>
    </div>
  )
}
