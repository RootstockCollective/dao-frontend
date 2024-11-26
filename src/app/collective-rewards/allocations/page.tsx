'use client'

import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Typography } from '@/components/Typography'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useAwaitedTxReporting } from '../shared'
import { Builder } from '../types'
import { useHandleErrors } from '../utils'
import {
  AllocationAmount,
  AllocationMetrics,
  BuilderAllocation,
  BuilderAllocationProps,
  Header,
} from './components'
import { AllocationsContext } from './context'

export default function Allocations() {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })
  const [resetCounter, setResetCounter] = useState(0)

  const error = executionError || receiptError

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Saving allocations',
    errorContent: 'Error saving allocations',
  })

  const router = useRouter()
  const {
    state: { allocations, getBuilder, isValidState },
    actions: { resetAllocations },
  } = useContext(AllocationsContext)

  const saveAllocations = () => {
    const [gauges, allocs, builders] = Object.entries(allocations).reduce(
      (acc, [key, value]) => {
        const builderAddress = key as Address
        const gauge = getBuilder(builderAddress)?.gauge
        if (gauge) {
          acc[0] = [...acc[0], gauge]
          acc[1] = [...acc[1], value]
          acc[2] = [...acc[2], builderAddress]
        }

        return acc
      },
      [[], [], []] as [Address[], bigint[], Address[]],
    )

    console.log(`😈 -------------------------------------------------------------------------😈`)
    console.log(
      `😈 ~ file: page.tsx:64 ~ saveAllocations ~ gauges, allocs, builders:`,
      gauges,
      allocs,
      builders,
    )
    console.log(`😈 -------------------------------------------------------------------------😈`)

    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: 'allocateBatch',
      args: [gauges, allocs],
    })
  }

  const onReset = useCallback(() => {
    resetAllocations()
    setResetCounter(prev => prev + 1)
  }, [resetAllocations])

  useHandleErrors({ error: executionError, title: 'Error saving allocations' })

  const cancel = () => {
    resetAllocations()
    router.back()
  }

  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <div className="flex flex-col justify-center items-start self-stretch gap-2">
          <Header />
        </div>
        <div className="flex flex-col items-start gap-6 self-stretch">
          <AllocationMetrics />
          <AllocationAmount key={resetCounter} />
        </div>
        <div className="flex flex-col items-start gap-4 self-stretch">
          <Typography tagVariant="h2" className="text-lg font-bold leading-[18px]">
            Selected Builders
          </Typography>
          <div className="flex items-start content-start flex-wrap gap-4 w-full">
            {Object.entries(allocations).map(([key, currentAllocation]) => {
              const builderAddress = key as Address
              const builderInfo = getBuilder(builderAddress) as Builder
              if (!builderInfo) {
                return null
              }

              const builder: BuilderAllocationProps = {
                ...builderInfo,
                currentAllocation,
                date: builderInfo.proposal.date,
              }
              return <BuilderAllocation key={builderAddress} {...builder} />
            })}
          </div>
          <div className="flex items-center self-stretch justify-between gap-4">
            <div className="flex gap-4">
              {/* TODO: review disabled statuses */}
              <Button disabled={!isValidState()} variant="primary" onClick={() => saveAllocations()}>
                {' '}
                Save allocations
              </Button>
              <Button variant="secondary" onClick={() => cancel()}>
                {' '}
                Cancel{' '}
              </Button>
            </div>

            <Button
              variant="borderless"
              onClick={() => onReset()}
              textClassName="font-bold text-[18px] text-primary"
            >
              {' '}
              Reset allocations
            </Button>
          </div>
        </div>
      </div>
    </MainContainer>
  )
}
