'use client'
import { useEffect, useState } from 'react'
import { MetricsCard } from '@/components/MetricsCard'
import { getCachedQuorumByBlockNumber } from '@/app/proposals/server/getQuorumByBlockNumber'

export function ProposalQuorum({ blockNumber }: { blockNumber: string }) {
  const [quorum, setQuorum] = useState<string>('')
  useEffect(() => {
    const fetchQuorum = async () => {
      const { quorum } = await getCachedQuorumByBlockNumber(blockNumber)
      setQuorum(quorum)
    }
    fetchQuorum()
  })

  return <MetricsCard title="Threshold" amount={`${quorum} VOTES`} borderless={true}></MetricsCard>
}
