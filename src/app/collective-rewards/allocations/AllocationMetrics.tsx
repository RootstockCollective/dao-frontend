'use client'

import { formatBalanceToHuman, getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import { useHandleErrors } from '../utils'
import { useBackerTotalAllocation } from './useBackerTotalAllocation'

type ValueProps = {
  value: string
}

type MetricsProps = ValueProps & {
  name: string
}

const Metric = ({ name, value }: MetricsProps) => {
  return (
    <div className="flex flex-col items-start gap-[10px]">
      <Paragraph className="font-bold tracking-[-0.28px] text-[14px]">{name}</Paragraph>
      <Paragraph className="font-kk-topo text-[48px] text-primary">{value}</Paragraph>
    </div>
  )
}

const Column = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col items-start gap-[10px] min-w-[200px] max-w-[20%]">{children}</div>
}

const Balance = ({ value }: ValueProps) => {
  return <Metric name="Balance" value={value} />
}
const BalanceWithSpinner = withSpinner(Balance)

const AllocatedAmount = ({ value }: ValueProps) => {
  return <Metric name="Allocated amount" value={value} />
}
const AllocatedAmountWithSpinner = withSpinner(AllocatedAmount)

const UnallocatedAmount = ({ value }: ValueProps) => {
  return <Metric name="Unallocated amount" value={value} />
}
const UnallocatedAmountWithSpinner = withSpinner(UnallocatedAmount)

export const AllocationMetrics = () => {
  // TODO: we can move this logic to a custom hook or to a context
  const { address, chainId } = useAccount()
  let {
    data,
    isLoading: balanceLoading,
    error: balanceError,
  } = useGetAddressTokens(address!, chainId as number)
  const stRIFBalance = getTokenBalance('stRIF', data)
  const balanceValue = `${stRIFBalance.balance} ${stRIFBalance.symbol}`
  balanceLoading = false

  let {
    data: allocatedAmount,
    isLoading: allocatedAmountLoading,
    error: allocatedAmountError,
  } = useBackerTotalAllocation(address!)
  const allocatedAmountValue = `${allocatedAmount} ${stRIFBalance.symbol}`
  allocatedAmountLoading = false
  allocatedAmount = 0n

  useHandleErrors({
    error: balanceError ?? allocatedAmountError,
    title: 'Failed to fetch balance and allocated amount',
  })

  const unformattedUnit = stRIFBalance.balance
  const formattedUnit = ethers.parseEther(unformattedUnit)
  const unallocatedAmount = formatBalanceToHuman(formattedUnit - (allocatedAmount || 0n))

  const unallocatedAmountValue = `${unallocatedAmount} ${stRIFBalance.symbol}`
  const unallocatedAmountLoading = balanceLoading || allocatedAmountLoading
  return (
    <div className="flex items-start gap-6 w-full">
      <Column>
        <BalanceWithSpinner value={balanceValue} isLoading={balanceLoading} />
      </Column>
      <Column>
        <AllocatedAmountWithSpinner value={allocatedAmountValue} isLoading={allocatedAmountLoading} />
      </Column>
      <Column>
        <UnallocatedAmountWithSpinner value={unallocatedAmountValue} isLoading={unallocatedAmountLoading} />
      </Column>
    </div>
  )
}
