import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakingToken } from '@/app/user/Stake/types'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/TypographyNew'
import { config } from '@/config'
import Big from '@/lib/big'
import { tokenContracts } from '@/lib/contracts'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { useUnstakeStRIF } from '../Stake/hooks/useUnstakeStRIF'
import { AllocationWarning } from './components/AllocationWarning'
import { UnstakeActions } from './components/UnstakeActions'
import { UnstakeInput } from './components/UnstakeInput'

interface Props {
  onCloseModal: () => void
}

export const UnstakeModal = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const { onRequestUnstake, isRequesting, isTxPending, isTxFailed, unstakeTxHash } = useUnstakeStRIF(
    amount,
    tokenContracts.stRIF,
  )

  const { data: backerTotalAllocation = 0n } = useReadBackersManager(
    { functionName: 'backerTotalAllocation', args: [address!] },
    { refetchInterval: 10000, enabled: !!address, initialData: 0n },
  )

  const stRifToken: StakingToken = useMemo(
    () => ({
      balance: balances.stRIF.balance,
      symbol: balances.stRIF.symbol,
      contract: tokenContracts.stRIF,
      price: prices.stRIF?.price.toString() || '0',
    }),
    [balances.stRIF.balance, balances.stRIF.symbol, prices.stRIF?.price],
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
      if (!value || value === '.') {
        setAmount('0')
      } else {
        const regex = /^\d*\.?\d{0,18}$/
        if (regex.test(value)) {
          // remove leading zeros
          setAmount(value.replace(/^0+(?=\d)/, ''))
        }
      }
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

  const handleUnstake = useCallback(async () => {
    if (!amount) return
    try {
      const txHash = await onRequestUnstake()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      onCloseModal()
    } catch (err) {
      if (!isUserRejectedTxError(err)) {
        console.error('Error requesting unstake', err)
      }
    }
  }, [amount, onRequestUnstake, onCloseModal])

  return (
    <Modal width={688} onClose={onCloseModal}>
      <div className="p-6">
        <Header className="mt-16 mb-4">UNSTAKE stRIF</Header>

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

        <UnstakeActions
          isTxPending={isTxPending}
          isRequesting={isRequesting}
          isTxFailed={isTxFailed}
          unstakeTxHash={unstakeTxHash}
          cannotProceed={cannotProceedWithUnstake}
          onUnstake={handleUnstake}
        />
      </div>
    </Modal>
  )
}
