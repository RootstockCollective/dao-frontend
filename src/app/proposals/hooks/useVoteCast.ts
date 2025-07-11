import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, Log, parseEventLogs } from 'viem'
import { fetchVoteCastEventByAccountAddress } from '@/app/user/Balances/actions'
import { Vote, VOTES_MAP } from '@/shared/types'
import { useEffect, useState } from 'react'

export const parseVoteCastEvents = (address: Address) => async () => {
  try {
    const { data } = await fetchVoteCastEventByAccountAddress(address)

    const events = parseEventLogs({
      abi: governor.abi,
      logs: data as unknown as Log[], // @TODO refine this
      eventName: 'VoteCast',
    })

    return events
  } catch (err) {
    console.log('ERROR in parseVoteCastEvents', err)
  }
}

export const useVoteCastEvent = (address: Address) => {
  return useQuery({
    queryFn: parseVoteCastEvents(address),
    queryKey: ['VoteCast'],
  })
}

export const useGetVoteForSpecificProposal = (
  address: Address,
  proposalId: string,
): [Vote | undefined, (vote: Vote | undefined) => void] => {
  const [vote, setVote] = useState<Vote | undefined>(undefined)

  const { data } = useQuery({
    queryFn: parseVoteCastEvents(address),
    queryKey: ['VoteCast'],
  })

  const event = data?.find(event => event.args.proposalId.toString() === proposalId)

  useEffect(() => {
    if (event) {
      setVote(VOTES_MAP.get(event.args.support as number) as Vote)
    }
  }, [event])

  return [vote, setVote]
}
