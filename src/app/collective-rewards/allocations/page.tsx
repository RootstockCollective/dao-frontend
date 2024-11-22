'use client'

import { Button } from '@/components/Button'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'
import { Builder } from '../types'
import {
  AllocationAmount,
  AllocationMetrics,
  BuilderAllocation,
  BuilderAllocationProps,
  Header,
} from './components'
import { AllocationsContext, AllocationsContextProvider } from './context'
import { BuilderContextProviderWithPrices } from '../user'
import { useActivatedBuildersWithGauge } from './hooks'

export default function Allocations() {
  const { data: builders } = useActivatedBuildersWithGauge()
  const router = useRouter()
  const {
    state: { allocations, getBuilder },
    actions: { resetAllocations },
  } = useContext(AllocationsContext)

  useEffect(() => {
    console.log(builders)
  }, [builders])

  const saveAllocations = () => {
    // TODO: save current allocations
  }

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
          <AllocationAmount />
        </div>
        <div className="flex flex-col items-start gap-4 self-stretch">
          <Typography tagVariant="h2" className="text-lg font-bold leading-[18px]">
            Selected Builders
          </Typography>
          <div className="flex items-start content-start flex-wrap gap-4">
            {Object.entries(allocations).map(([key, currentAllocation]) => {
              const index = Number(key)
              const builderInfo = getBuilder(index) as Builder
              const builder: BuilderAllocationProps = {
                ...builderInfo,
                index,
                currentAllocation,
                date: builderInfo.proposal.date,
              }
              return <BuilderAllocation key={index} {...builder} />
            })}
          </div>
          <div className="flex items-center self-stretch justify-between gap-4">
            <div className="flex gap-4">
              {/* TODO: review disabled statuses */}
              <Button variant="primary" onClick={() => saveAllocations()}>
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
              onClick={() => resetAllocations()}
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
