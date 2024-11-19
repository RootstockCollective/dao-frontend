'use client'

import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Typography } from '@/components/Typography'
import { AllocationAmount } from './AllocationAmount'
import { AllocationMetrics } from './AllocationMetrics'
import { BuilderAllocation } from './BuilderAllocation'
import { Header } from './Header'
import { BuilderAllocationProps } from './types'
import { useState } from 'react'

const ALLOCATION_EXCEED_AMOUNT_ERROR = 'Builder allocations exceeds amount to allocate'

export default function Allocations() {
  /* TODO: Error message is set when
   * - the cumulative amount exceeds the allocation amount (ALLOCATION_EXCEED_AMOUNT_ERROR)
   */
  const [errorMessage, setErrorMessage] = useState<string>('')
  const builders: BuilderAllocationProps[] = [
    {
      builderName: 'Builder 1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Active',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 10,
      currentAllocation: 70,
    },
    {
      builderName: 'Builder 2',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Active',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 8,
      currentAllocation: 50,
    },
    {
      builderName: 'Builder 3',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Deactivated',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 100,
      currentAllocation: 20,
    },
    {
      builderName: 'Builder 4',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Paused',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 99,
      currentAllocation: 100,
    },
    {
      builderName: 'Builder 5',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Deactivated',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 99,
      currentAllocation: 100,
    },
    {
      builderName: 'Builder 6',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'Active',
      joiningDate: '2021-10-01',
      allocationLeft: 50000000000000000000n,
      backerRewards: 99,
      currentAllocation: 100,
    },
  ]
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <div className="flex flex-col justify-center items-start self-stretch gap-2">
          <Header />
        </div>
        <div className="flex flex-col items-start gap-6 self-stretch">
          <AllocationMetrics />
          <AllocationAmount
            // TODO: balance set only to make the percentage buttons work
            balance={50000000000000000000n}
            errorMessage={errorMessage}
          />
        </div>
        <div className="flex flex-col items-start gap-4 self-stretch">
          <Typography tagVariant="h2" className="text-lg font-bold leading-[18px]">
            Selected Builders
          </Typography>
          <div className="flex items-start content-start flex-wrap gap-4">
            {builders.map((builder, index) => (
              <BuilderAllocation key={index} {...builder} />
            ))}
          </div>
        </div>
      </div>
    </MainContainer>
  )
}
