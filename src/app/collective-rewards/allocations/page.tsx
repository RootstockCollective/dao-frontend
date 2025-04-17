'use client'

import { Button } from '@/components/Button'
import { Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Address } from 'viem'
import { Builder } from '../types'
import {
  AllocationAmount,
  AllocationMetrics,
  BuilderAllocation,
  BuilderAllocationProps,
  Header,
} from './components'
import { AllocationsContext } from './context'
import { useAllocateVotes } from './hooks/useAllocateVotes'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Allocations() {
  const [resetCounter, setResetCounter] = useState(0)
  const { isConnected } = useAccount()
  const router = useRouter()

  const {
    state: { allocations, getBuilder },
    actions: { resetAllocations },
  } = useContext(AllocationsContext)

  const { saveAllocations, canSaveAllocation } = useAllocateVotes()

  const onReset = useCallback(() => {
    resetAllocations()
    setResetCounter(prev => prev + 1)
  }, [resetAllocations])

  const cancel = () => {
    resetAllocations()
    router.back()
  }

  useEffect(() => {
    if (!isConnected) {
      router.replace('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return <LoadingSpinner />
  }

  return (
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
            <Button disabled={!canSaveAllocation} variant="primary" onClick={() => saveAllocations()}>
              Save allocations
            </Button>
            <Button variant="secondary" onClick={() => cancel()}>
              Cancel
            </Button>
          </div>

          <Button
            variant="borderless"
            onClick={() => onReset()}
            textClassName="font-bold text-[18px] text-primary"
          >
            Reset allocations
          </Button>
        </div>
      </div>
    </div>
  )
}
