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
import { PercentageButtons } from '@/components/PercentageButtons'
import { formatEther } from 'viem'
import { usePricesContext } from '@/shared/context'
import { DEFAULT_SLIPPAGE_PERCENTAGE } from '../utils/slippage'
import { Input } from '@/components/Input'
import { SlippageInput } from './SlippageInput'
import Image from 'next/image'

interface Props {
  onCloseModal: () => void
}

export const WithdrawModal = ({ onCloseModal }: Props) => {
  const { prices } = usePricesContext()

  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const [slippagePercentage, setSlippagePercentage] = useState(DEFAULT_SLIPPAGE_PERCENTAGE.toString())
  const {
    userUsdrifBalance,
    formattedUserUsdrifBalance,
    isLoading: isVaultBalanceLoading,
  } = useVaultBalance()

  const { onRequestWithdraw, isRequesting, isTxPending, isTxFailed, withdrawTxHash } = useWithdrawFromVault(
    amount,
    parseFloat(slippagePercentage),
  )

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
          <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
            <Label className="mb-3" data-testid="LabelText">
              Amount to withdraw
            </Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                name="amount-vault"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className={cn('grow', 'text-2xl font-bold', errorMessage ? 'text-error' : '')}
                data-testid="AmountInput"
                placeholder="0"
                inputProps={{ decimalScale: 18 }}
              />
              <div className="flex items-center gap-1 shrink-0">
                <TokenImage symbol="USDRIF" size={24} />
                <Label variant="body-l" bold data-testid="Symbol">
                  USDRIF
                </Label>
              </div>
            </div>
            {amountToCurrency && (
              <Label variant="body-s" className="text-bg-0 mt-2" data-testid="CurrencyValue">
                {amountToCurrency}
              </Label>
            )}

            {/* Slippage field below the input */}
            <SlippageInput
              value={slippagePercentage}
              onChange={setSlippagePercentage}
              name="slippage-withdraw-input"
            />

            {errorMessage && (
              <div className="flex items-start gap-2 mt-2 max-w-full">
                <Image
                  src="/images/warning-icon.svg"
                  alt="Warning"
                  width={24}
                  height={24}
                  className="shrink-0 mt-1"
                />
                <Label className="text-error break-words" data-testid="ErrorText">
                  {errorMessage}
                </Label>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
            <div className="flex items-center gap-1">
              <TokenImage symbol="USDRIF" size={16} />
              <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
                Your Vault Balance: {formattedUserUsdrifBalance}
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
