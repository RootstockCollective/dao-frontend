import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { StakeInput } from '@/app/user/Stake/StakeInputNew'
import { StakingToken } from '@/app/user/Stake/types'
import { Button } from '@/components/ButtonNew/Button'
import { Modal } from '@/components/Modal'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import Big from '@/lib/big'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { Divider } from '@/components/Divider'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { config } from '@/config'
import { useUnstakeStRIF } from '../Stake/hooks/useUnstakeStRIF'
import { ProgressButton } from '@/components/ProgressBarNew'

interface Props {
  onCloseModal: () => void
}

export const UnstakeModal = ({ onCloseModal }: Props) => {
  const { balances, prices } = useBalancesContext()
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const { onRequestUnstake, isRequesting, isTxPending, isTxFailed } = useUnstakeStRIF(tokenContracts.stRIF)

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

  const amountToCurrency = useMemo(
    () => formatCurrency(Big(stRifToken.price || 0).mul(amount || 0)),
    [stRifToken.price, amount],
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

  const errorMessage = useMemo(() => {
    if (isAmountOverBalance) {
      return 'This is more than the available stRIF balance. Please update the amount.'
    }
    return ''
  }, [isAmountOverBalance])

  const cannotProceedWithUnstake = useMemo(
    () => isAmountOverBalance || !amount || Big(amount).gt(availableToUnstake) || isRequesting,
    [isAmountOverBalance, amount, availableToUnstake, isRequesting],
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
      const txHash = await onRequestUnstake(amount)
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      onCloseModal()
    } catch (err) {
      if (!isUserRejectedTxError(err)) {
        console.error('Error requesting allowance', err)
      }
    }
  }, [amount, onRequestUnstake])

  return (
    <Modal width={688} onClose={onCloseModal}>
      <div className="p-6">
        <Header className="mt-16 mb-4">UNSTAKE stRIF</Header>

        <StakeInput
          value={amount}
          onChange={handleAmountChange}
          symbol="stRIF"
          labelText="Amount to unstake"
          currencyValue={amountToCurrency}
          decimalScale={18}
          errorText={errorMessage}
        />

        <div className="flex items-center justify-between mx-3 mt-2">
          <div className="flex items-center gap-1">
            <TokenImage symbol="RIF" size={12} />
            <Label variant="body-s" className="text-text-60" data-testid="totalBalanceLabel">
              stRIF available to unstake: {availableToUnstake}
            </Label>
          </div>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              onClick={() => handlePercentageClick(0.1)}
              className="bg-transparent border border-bg-40 px-2 py-0"
            >
              <Span variant="body-s">10%</Span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePercentageClick(0.2)}
              className="bg-transparent border border-bg-40 px-2 py-0"
            >
              <Span variant="body-s">20%</Span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePercentageClick(0.5)}
              className="bg-transparent border border-bg-40 px-2 py-0"
            >
              <Span variant="body-s">50%</Span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePercentageClick(1)}
              className="bg-transparent border border-bg-40 px-2 py-0"
              data-testid="maxButton"
            >
              <Span variant="body-s">Max</Span>
            </Button>
          </div>
        </div>

        {backerTotalAllocation > 0n && (
          <>
            <div className="flex items-center gap-2 mb-2 mt-10">
              <Image src="/images/info-icon.svg" alt="Info" width={40} height={40} />
              <Paragraph>
                You have{' '}
                <Span variant="body" bold>
                  {formatEther(backerTotalAllocation)} stRIF
                </Span>{' '}
                in votes allocated in the Collective Rewards. You must de-allocate it, before unstaking all
                your stRIF.
              </Paragraph>
            </div>
            <div className="flex items-center gap-2 mb-6 ml-12">
              <TokenImage symbol="stRIF" size={16} />
              <Span variant="body-s" className="text-text-60">
                stRIF balance: {stRifToken.balance}
              </Span>
            </div>
          </>
        )}

        <Divider className="mt-8" />

        <div className="flex justify-end">
          {isTxPending ? (
            <ProgressButton className="whitespace-nowrap">
              <Span bold className="text-text-60">
                In progress
              </Span>
              <Span className="text-text-80 hidden md:inline">&nbsp;- 1 min average</Span>
              <Span className="text-text-80 md:hidden">&nbsp;- 1 min avg</Span>
            </ProgressButton>
          ) : (
            <Button variant="primary" onClick={handleUnstake} disabled={cannotProceedWithUnstake}>
              {isRequesting ? 'Requesting...' : 'Unstake'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
