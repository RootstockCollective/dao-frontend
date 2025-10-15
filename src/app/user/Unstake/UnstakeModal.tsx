import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/Typography'
import Big from '@/lib/big'
import { STRIF, TOKENS } from '@/lib/tokens'
import { cn, handleAmountInput } from '@/lib/utils'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { executeTxFlow } from '@/shared/notification'
import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { TransactionInProgressButton } from '../Stake/components/TransactionInProgressButton'
import { TransactionStatus } from '../Stake/components/TransactionStatus'
import { useUnstakeStRIF } from '../Stake/hooks/useUnstakeStRIF'
import { AllocationWarning } from './components/AllocationWarning'
import { UnstakeInput } from './components/UnstakeInput'

interface Props {
  onCloseModal: () => void
}

export const UnstakeModal = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()
  const { address } = useAccount()
  const isDesktop = useIsDesktop()

  const [amount, setAmount] = useState('')
  const { onRequestUnstake, isRequesting, isTxPending, isTxFailed, unstakeTxHash } = useUnstakeStRIF(
    amount,
    TOKENS.stRIF.address,
  )

  const { data: backerTotalAllocation = 0n } = useReadBackersManager(
    { functionName: 'backerTotalAllocation', args: [address!] },
    { refetchInterval: 10000, enabled: !!address, initialData: 0n },
  )

  const stRifToken: StakingToken = useMemo(
    () => ({
      balance: balances[STRIF]?.balance ?? '0',
      symbol: STRIF,
      contract: TOKENS[STRIF].address,
      price: prices[STRIF]?.price.toString() || '0',
    }),
    [balances[STRIF]?.balance, balances[STRIF]?.symbol, prices[STRIF]?.price],
  )

  const availableToUnstake = useMemo(() => {
    const balanceInWei = parseEther(stRifToken.balance)
    return formatEther(balanceInWei - backerTotalAllocation)
  }, [stRifToken.balance, backerTotalAllocation])

  const isAmountOverBalance = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    const rawBalance = Big(stRifToken.balance)
    return rawAmount.gt(rawBalance)
  }, [amount, stRifToken.balance])

  const isAmountOverAvailableToUnstake = useMemo(() => {
    if (!amount) return false
    const rawAmount = Big(amount)
    return rawAmount.gt(availableToUnstake)
  }, [amount, availableToUnstake])

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than the available stRIF balance. Please update the amount.'
    }
    return ''
  }, [isAmountOverBalance])

  const cannotProceedWithUnstake = useMemo(
    () => !amount || !Big(amount).gt(0) || Big(amount).gt(availableToUnstake) || isRequesting,
    [amount, availableToUnstake, isRequesting],
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(handleAmountInput(value))
    },
    [setAmount],
  )

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const amount = Big(stRifToken.balance).mul(percentage).toString()
      setAmount(amount)
    },
    [stRifToken.balance],
  )

  const handleConfirmUnstake = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestUnstake,
      onSuccess: onCloseModal,
      action: 'unstaking',
    })
  }, [onRequestUnstake, onCloseModal])

  return (
    <Modal width={688} onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
        <Header className="mt-16 mb-4">UNSTAKE stRIF</Header>

        <div className="flex-1">
          <UnstakeInput
            amount={amount}
            onAmountChange={handleAmountChange}
            onPercentageClick={handlePercentageClick}
            stRifToken={stRifToken}
            availableToUnstake={availableToUnstake}
            errorMessage={errorMessage}
          />

          {isAmountOverAvailableToUnstake && (
            <AllocationWarning
              backerTotalAllocation={backerTotalAllocation}
              stRifBalance={stRifToken.balance}
            />
          )}

          <TransactionStatus
            txHash={unstakeTxHash}
            isTxFailed={isTxFailed}
            failureMessage="Unstake TX failed."
            className="mt-8"
          />
        </div>

        <Divider className="mb-4 mt-6" />

        <UnstakeActions
          isTxPending={isTxPending}
          isRequesting={isRequesting}
          cannotProceed={cannotProceedWithUnstake}
          onUnstake={handleConfirmUnstake}
        />
      </div>
    </Modal>
  )
}

interface UnstakeActionsProps {
  isTxPending: boolean
  isRequesting: boolean
  cannotProceed: boolean
  onUnstake: () => void
}

const UnstakeActions = ({ isTxPending, isRequesting, cannotProceed, onUnstake }: UnstakeActionsProps) => {
  if (isTxPending) {
    return <TransactionInProgressButton />
  }

  return (
    <div className="flex justify-end">
      <Button variant="primary" onClick={onUnstake} disabled={cannotProceed} data-testid="UnstakeButton">
        {isRequesting ? 'Requesting...' : 'Unstake'}
      </Button>
    </div>
  )
}
