import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, handleAmountInput, formatCurrency } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useSupplyToVault } from '../hooks/useSupplyToVault'
import { useVaultAllowance } from '../hooks/useVaultAllowance'
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

interface Props {
  onCloseModal: () => void
}

export const SupplyModal = ({ onCloseModal }: Props) => {
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { prices } = usePricesContext()
  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const usdrifBalance = balances[USDRIF]

  const {
    onRequestSupply,
    isRequesting: isSupplyRequesting,
    isTxPending: isSupplyPending,
    isTxFailed: isSupplyFailed,
    supplyTxHash,
  } = useSupplyToVault(amount)

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting: isAllowanceRequesting,
    isTxPending: isAllowancePending,
    isTxFailed: isAllowanceFailed,
    allowanceTxHash,
  } = useVaultAllowance(amount)

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
    return ''
  }, [isAmountOverBalance])

  const cannotProceedWithSupply = useMemo(
    () => !amount || !Big(amount).gt(0) || isAmountOverBalance || isSupplyRequesting,
    [amount, isAmountOverBalance, isSupplyRequesting],
  )

  const cannotProceedWithAllowance = useMemo(
    () =>
      !amount || !Big(amount).gt(0) || isAmountOverBalance || isAllowanceRequesting || isAllowanceReadLoading,
    [amount, isAmountOverBalance, isAllowanceRequesting, isAllowanceReadLoading],
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

  const handleConfirmSupply = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestSupply,
      onSuccess: onCloseModal,
      action: 'vaultDeposit',
    })
  }, [onRequestSupply, onCloseModal])

  const handleRequestAllowance = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: () => {},
      action: 'vaultAllowance',
    })
  }, [onRequestAllowance])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const amountToCurrency = formatCurrency(Big(prices['USDRIF']?.price || 0).mul(amount || 0))

  return (
    <Modal width={688} onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
        <Header className="mt-16 mb-4">SUPPLY USDRIF</Header>

        <div className="flex-1">
          <VaultInput
            ref={inputRef}
            value={amount}
            onChange={handleAmountChange}
            symbol="USDRIF"
            labelText="Amount to supply"
            currencyValue={amountToCurrency}
            errorText={errorMessage}
          />

          <div className="flex flex-col justify-between mx-3 mt-2 gap-2">
            <div className="flex items-center gap-1">
              <TokenImage symbol="USDRIF" size={12} />
              <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
                USDRIF available: {usdrifBalance.formattedBalance}
              </Label>
            </div>
            <div className="flex gap-1 self-end">
              <PercentageButtons onPercentageClick={handlePercentageClick} />
            </div>
          </div>

          {!isAllowanceEnough && amount && Big(amount).gt(0) && !isAmountOverBalance && (
            <div className="mt-4 p-4 bg-bg-80 rounded-1">
              <Paragraph variant="body-s" className="text-text-60">
                You need to approve USDRIF before supplying to the vault.
              </Paragraph>
            </div>
          )}

          <TransactionStatus
            txHash={allowanceTxHash || supplyTxHash}
            isTxFailed={isAllowanceFailed || isSupplyFailed}
            failureMessage={isAllowanceFailed ? 'Allowance TX failed.' : 'Supply TX failed.'}
            className="mt-8"
          />
        </div>

        <Divider className="mb-4 mt-6" />

        <SupplyActions
          isAllowanceEnough={isAllowanceEnough}
          isAllowancePending={isAllowancePending}
          isSupplyPending={isSupplyPending}
          isAllowanceRequesting={isAllowanceRequesting}
          isSupplyRequesting={isSupplyRequesting}
          cannotProceedWithAllowance={cannotProceedWithAllowance}
          cannotProceedWithSupply={cannotProceedWithSupply}
          onRequestAllowance={handleRequestAllowance}
          onSupply={handleConfirmSupply}
        />
      </div>
    </Modal>
  )
}

interface SupplyActionsProps {
  isAllowanceEnough: boolean
  isAllowancePending: boolean
  isSupplyPending: boolean
  isAllowanceRequesting: boolean
  isSupplyRequesting: boolean
  cannotProceedWithAllowance: boolean
  cannotProceedWithSupply: boolean
  onRequestAllowance: () => void
  onSupply: () => void
}

const SupplyActions = ({
  isAllowanceEnough,
  isAllowancePending,
  isSupplyPending,
  isAllowanceRequesting,
  isSupplyRequesting,
  cannotProceedWithAllowance,
  cannotProceedWithSupply,
  onRequestAllowance,
  onSupply,
}: SupplyActionsProps) => {
  if (isAllowancePending || isSupplyPending) {
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
        onClick={onSupply}
        disabled={cannotProceedWithSupply}
        data-testid="SupplyButton"
      >
        {isSupplyRequesting ? 'Requesting...' : 'Supply'}
      </Button>
    </div>
  )
}
