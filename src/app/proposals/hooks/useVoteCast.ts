import { governor } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { Address, Log, parseEventLogs, zeroAddress } from 'viem'
import { fetchVoteCastEventByAccountAddress } from '@/app/user/Balances/actions'
import { Vote, VOTES_MAP } from '@/shared/types'
import { useEffect, useState } from 'react'

export const parseVoteCastEvents = async (address: Address) => {
  try {
    const { data } = await fetchVoteCastEventByAccountAddress(address)

    if (!data) {
      return []
    }

    const events = parseEventLogs({
      abi: governor.abi,
      logs: data as unknown as Log[], // @TODO refine this
      eventName: 'VoteCast',
    })

    return events
  } catch (err) {
    console.log('ERROR in parseVoteCastEvents', err)
    throw new Error('Failed to fetch vote cast events.')
  }
}

export const useGetVoteForSpecificProposal = (
  address: Address = zeroAddress,
  proposalId: string,
): [Vote | undefined, (vote: Vote | undefined) => void] => {
  const [vote, setVote] = useState<Vote | undefined>(undefined)

  const { data: voteEvents } = useQuery({
    queryFn: () => parseVoteCastEvents(address),
    queryKey: ['VoteCast', address],
    enabled: !!address && !!proposalId, // Query will only run if both address and proposalId are present
  })

  const event = voteEvents?.find(event => event.args.proposalId.toString() === proposalId)

  useEffect(() => {
    if (address !== zeroAddress && event?.args?.support !== undefined) {
      setVote(VOTES_MAP.get(event.args.support as number) as Vote)
    } else {
      // If no event is found for the given proposalId, ensure the vote state is reset.
      setVote(undefined)
    }
  }, [address, event])

  return [vote, setVote]
}
