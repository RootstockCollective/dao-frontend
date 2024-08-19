'use client'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { STAKING_MESSAGES } from '../proposals/shared/utils'
import { useAlertContext } from '../providers'

export default function User() {
  const searchParams = useSearchParams()
  const txHash = searchParams?.get('txHash')
  const { data, isError, isLoading } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  })
  const { setMessage } = useAlertContext()

  useEffect(() => {
    if (txHash && !isLoading) {
      if (isError) {
        setMessage(STAKING_MESSAGES.error)
      } else if (data?.status === 'success') {
        setMessage(STAKING_MESSAGES.success)
      }
    }
  }, [data, data?.status, isError, isLoading, setMessage, txHash])

  return (
    <MainContainer>
      <div className="pl-[24px] pr-[10px] mb-[100px] w-full">
        <BalancesSection />
        <CommunitiesSection />
      </div>
    </MainContainer>
  )
}
