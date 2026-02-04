import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, handleAmountInput, formatCurrency } from '@/lib/utils'
import { formatSymbol } from '@/app/shared/formatter'
import { executeTxFlow } from '@/shared/notification'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useDepositToVault } from '../hooks/useDepositToVault'
import { useVaultAllowance } from '../hooks/useVaultAllowance'
import { useCanDepositToVault } from '../hooks/useCanDepositToVault'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Divider } from '@/components/Divider'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { TokenImage } from '@/components/TokenImage'
import { PercentageButtons } from '@/components/PercentageButtons'
import { USDRIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'
import { TermsAndConditionsModal } from './TermsAndConditionsModal'
import { useVaultTermsAcceptance } from '../hooks/useVaultTermsAcceptance'
import { useVaultDepositLimiter } from '../hooks/useVaultDepositLimiter'
import { ExternalLink } from '@/components/Link'
import { VAULT_KYC_URL } from '@/lib/constants'
import { DEFAULT_SLIPPAGE_PERCENTAGE } from '../utils/slippage'
import { Input } from '@/components/Input'
import { SlippageInput } from './SlippageInput'
import Image from 'next/image'

interface Props {
  onCloseModal: () => void
  onTransactionSuccess?: () => void
}

const KycInfo = () => {
  const { maxDefaultDepositLimit, isWhitelisted } = useVaultDepositLimiter()
  const formattedDefaultLimit = formatSymbol(maxDefaultDepositLimit, USDRIF)

  // Don't show KYC info for whitelisted users
  if (isWhitelisted) {
    return null
  }

  return (
    <Paragraph variant="body-s" className="text-text-60 px-4 pt-4">
      To deposit more than {formattedDefaultLimit} USD, please{' '}
      <ExternalLink
        href={VAULT_KYC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline cursor-pointer"
        data-testid="KycLink"
      >
        <Span variant="body-s">talk to the team</Span>
      </ExternalLink>{' '}
      and register your interest in joining the invited, whitelisted testing group.
    </Paragraph>
  )
}

export const DepositModal = ({ onCloseModal, onTransactionSuccess }: Props) => {
  const { balances } = useGetAddressBalances()
  const { prices } = usePricesContext()
  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const [slippagePercentage, setSlippagePercentage] = useState(DEFAULT_SLIPPAGE_PERCENTAGE.toString())
  const [shouldShowTermsModal, setShouldShowTermsModal] = useState(false)
  const { hasAcceptedTerms } = useVaultTermsAcceptance()
  const usdrifBalance = balances[USDRIF]

  const {
    onRequestDeposit,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositPending,
    isTxFailed: isDepositFailed,
    depositTxHash,
  } = useDepositToVault(amount, parseFloat(slippagePercentage))

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
  } = useCanDepositToVault(amount)

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
      onSuccess: () => {
        onTransactionSuccess?.()
        onCloseModal()
      },
      action: 'vaultDeposit',
    })
  }, [onRequestDeposit, onCloseModal, onTransactionSuccess])

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
      <Modal onClose={onCloseModal} data-testid="DepositModal">
        <div className="h-full flex flex-col p-4 md:p-6">
          <Header className="mt-16 mb-4">DEPOSIT USDRIF</Header>

          <div className="flex-1">
            <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60">
              <Label className="mb-3" data-testid="LabelText">
                Amount to deposit
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
              {isAllowanceEnough && !isAllowancePending && (
                <SlippageInput
                  value={slippagePercentage}
                  onChange={setSlippagePercentage}
                  name="slippage-deposit-input"
                />
              )}

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

            <div className="flex flex-col justify-between mx-3 my-2 gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <TokenImage symbol="USDRIF" size={16} />
                  <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
                    Your Wallet Balance: {usdrifBalance.formattedBalance}
                  </Label>
                </div>
              </div>
              <div className="flex gap-1 self-end">
                <PercentageButtons onPercentageClick={handlePercentageClick} />
              </div>
            </div>

            {!isAllowanceEnough && amount && Big(amount).gt(0) && !isAmountOverBalance && (
              <div className="p-4 pb-0 bg-bg-80 rounded-1">
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

          <KycInfo />
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
