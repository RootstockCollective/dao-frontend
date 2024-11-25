'use client'

import { Paragraph } from '@/components/Typography'
import { useContext } from 'react'
import { formatEther } from 'viem'
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

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

const AllocatedAmount = ({ value }: ValueProps) => {
  return <Metric name="Allocated amount" value={value} />
}

const UnallocatedAmount = ({ value }: ValueProps) => {
  return <Metric name="Unallocated amount" value={value} />
}

export const AllocationMetrics = () => {
  const {
    initialState: {
      backer: { amountToAllocate, balance },
    },
  } = useContext(AllocationsContext)

  const balanceValue = `${formatEther(balance)} stRIF`

  const allocatedAmountValue = `${formatEther(amountToAllocate)} stRIF`

  const unallocatedAmount = formatEther(balance - amountToAllocate)

  const unallocatedAmountValue = `${unallocatedAmount} stRIF`
  return (
    <div className="flex items-start gap-6 w-full">
      <Column>
        <Balance value={balanceValue} />
      </Column>
      <Column>
        <AllocatedAmount value={allocatedAmountValue} />
      </Column>
      <Column>
        <UnallocatedAmount value={unallocatedAmountValue} />
      </Column>
    </div>
  )
}
