import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, handleAmountInput, formatCurrency } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useDepositToVault } from '../hooks/useDepositToVault'
import { useVaultAllowance } from '../hooks/useVaultAllowance'
import { useCanDepositToVault } from '../hooks/useCanDepositToVault'
import { useVaultDepositLimiter } from '../hooks/useVaultDepositLimiter'
import { formatEther } from 'viem'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Divider } from '@/components/Divider'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { VaultInput } from './VaultInput'
import { TokenImage } from '@/components/TokenImage'
import { PercentageButtons } from '@/app/user/Unstake/components/PercentageButtons'
import { USDRIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'
import { TermsAndConditionsModal } from './TermsAndConditionsModal'
import { useVaultTermsAcceptance } from '../hooks/useVaultTermsAcceptance'

interface Props {
  onCloseModal: () => void
}

export const DepositModal = ({ onCloseModal }: Props) => {
  const { balances } = useGetAddressBalances()
  const { prices } = usePricesContext()
  const { userDeposits } = useVaultDepositLimiter()
  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const [shouldShowTermsModal, setShouldShowTermsModal] = useState(false)
  const { hasAcceptedTerms } = useVaultTermsAcceptance()
  const usdrifBalance = balances[USDRIF]

  const {
    onRequestDeposit,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositPending,
    isTxFailed: isDepositFailed,
    depositTxHash,
  } = useDepositToVault(amount)

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting: isAllowanceRequesting,
    isTxPending: isAllowancePending,
    isTxFailed: isAllowanceFailed,
    allowanceTxHash,
  } = useVaultAllowance(amount)

  const {
    canDeposit: isValidAmount,
    reason: depositLimitReason,
    isLoading: isDepositValidationLoading,
    maxDepositLimit,
  } = useCanDepositToVault(amount)

  // Use the same data source as validation (deposit limiter) for consistency
  const formattedUserDeposits = Big(formatEther(userDeposits)).toFixedNoTrailing(2)

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    const rawBalance = Big(usdrifBalance.balance)
    return rawAmount.gt(rawBalance)
  }, [amount, usdrifBalance.balance])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than the available USDRIF balance. Please update the amount.'
    }
    if (!isValidAmount && depositLimitReason) {
      return depositLimitReason
    }
    return ''
  }, [isAmountOverBalance, isValidAmount, depositLimitReason])

  const cannotProceedWithDeposit = useMemo(
    () =>
      !amount ||
      !Big(amount).gt(0) ||
      isAmountOverBalance ||
      !isValidAmount ||
      isDepositValidationLoading ||
      isDepositRequesting,
    [amount, isAmountOverBalance, isValidAmount, isDepositValidationLoading, isDepositRequesting],
  )

  const cannotProceedWithAllowance = useMemo(
    () =>
      !amount ||
      !Big(amount).gt(0) ||
      isAmountOverBalance ||
      !isValidAmount ||
      isDepositValidationLoading ||
      isAllowanceRequesting ||
      isAllowanceReadLoading,
    [
      amount,
      isAmountOverBalance,
      isValidAmount,
      isDepositValidationLoading,
      isAllowanceRequesting,
      isAllowanceReadLoading,
    ],
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const calculatedAmount = Big(usdrifBalance.balance).mul(percentage).toString()
      setAmount(calculatedAmount)
    },
    [usdrifBalance.balance],
  )

  const handleConfirmDeposit = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestDeposit,
      onSuccess: onCloseModal,
      action: 'vaultDeposit',
    })
  }, [onRequestDeposit, onCloseModal])

  const handleRequestAllowance = useCallback(() => {
    if (!hasAcceptedTerms) {
      setShouldShowTermsModal(true)
      return
    }

    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: () => {},
      action: 'vaultAllowance',
    })
  }, [onRequestAllowance, hasAcceptedTerms])

  const handleTermsAccepted = useCallback(() => {
    setShouldShowTermsModal(false)
    // Proceed with allowance after accepting terms
    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: () => {},
      action: 'vaultAllowance',
    })
  }, [onRequestAllowance])

  const handleTermsDeclined = useCallback(() => {
    setShouldShowTermsModal(false)
    // Don't proceed with allowance when terms are declined
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const amountToCurrency = formatCurrency(Big(prices['USDRIF']?.price || 0).mul(amount || 0))

  return (
    <>
      <Modal width={688} onClose={onCloseModal} fullscreen={!isDesktop}>
        <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
          <Header className="mt-16 mb-4">DEPOSIT USDRIF</Header>

          <div className="flex-1">
            <VaultInput
              ref={inputRef}
              value={amount}
              onChange={handleAmountChange}
              symbol="USDRIF"
              labelText="Amount to deposit"
              currencyValue={amountToCurrency}
              errorText={errorMessage}
            />

            <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <TokenImage symbol="USDRIF" size={12} />
                  <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
                    USDRIF available: {usdrifBalance.formattedBalance}
                  </Label>
                </div>
                <div className="flex items-center gap-1">
                  <TokenImage symbol="USDRIF" size={12} />
                  <Label variant="body-s" className="text-text-60" data-testid="depositLimitLabel">
                    Vault deposits: {formattedUserDeposits} / {maxDepositLimit} USDRIF
                  </Label>
                </div>
              </div>
              <div className="flex gap-1 self-end">
                <PercentageButtons onPercentageClick={handlePercentageClick} />
              </div>
            </div>

            {!isAllowanceEnough && amount && Big(amount).gt(0) && !isAmountOverBalance && (
              <div className="mt-4 p-4 bg-bg-80 rounded-1">
                <Paragraph variant="body-s" className="text-text-60">
                  You need to approve USDRIF before depositing to the vault.
                </Paragraph>
              </div>
            )}

            {isAllowancePending && allowanceTxHash && (
              <TransactionStatus
                txHash={allowanceTxHash}
                isTxFailed={isAllowanceFailed}
                failureMessage="Allowance TX failed."
                className="mt-8"
              />
            )}
            {depositTxHash && (
              <TransactionStatus
                txHash={depositTxHash}
                isTxFailed={isDepositFailed}
                failureMessage="Deposit TX failed."
                className="mt-8"
              />
            )}
          </div>

          <Divider className="mb-4 mt-6" />

          <DepositActions
            isAllowanceEnough={isAllowanceEnough}
            isAllowancePending={isAllowancePending}
            isDepositPending={isDepositPending}
            isAllowanceRequesting={isAllowanceRequesting}
            isDepositRequesting={isDepositRequesting}
            cannotProceedWithAllowance={cannotProceedWithAllowance}
            cannotProceedWithDeposit={cannotProceedWithDeposit}
            onRequestAllowance={handleRequestAllowance}
            onDeposit={handleConfirmDeposit}
          />
        </div>
      </Modal>

      <TermsAndConditionsModal
        shouldShow={shouldShowTermsModal}
        onAgree={handleTermsAccepted}
        onDecline={handleTermsDeclined}
      />
    </>
  )
}

interface DepositActionsProps {
  isAllowanceEnough: boolean
  isAllowancePending: boolean
  isDepositPending: boolean
  isAllowanceRequesting: boolean
  isDepositRequesting: boolean
  cannotProceedWithAllowance: boolean
  cannotProceedWithDeposit: boolean
  onRequestAllowance: () => void
  onDeposit: () => void
}

const DepositActions = ({
  isAllowanceEnough,
  isAllowancePending,
  isDepositPending,
  isAllowanceRequesting,
  isDepositRequesting,
  cannotProceedWithAllowance,
  cannotProceedWithDeposit,
  onRequestAllowance,
  onDeposit,
}: DepositActionsProps) => {
  if (isAllowancePending || isDepositPending) {
    return <TransactionInProgressButton />
  }

  if (!isAllowanceEnough) {
    return (
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onRequestAllowance}
          disabled={cannotProceedWithAllowance}
          data-testid="ApproveButton"
        >
          {isAllowanceRequesting ? 'Requesting...' : 'Approve USDRIF'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <Button
        variant="primary"
        onClick={onDeposit}
        disabled={cannotProceedWithDeposit}
        data-testid="DepositButton"
      >
        {isDepositRequesting ? 'Requesting...' : 'Deposit'}
      </Button>
    </div>
  )
}
