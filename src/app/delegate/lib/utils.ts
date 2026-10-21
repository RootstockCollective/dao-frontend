import { formatEther } from 'viem'

import Big from '@/lib/big'
import { resolveRnsDomain } from '@/lib/rns'

/** Share of all delegated voting power, with two decimals. `votingPower` in stRIF, total in wei. */
export const getVotingWeightPercent = (
  votingPower: number | string | undefined,
  totalDelegatedVotes: bigint | undefined,
): string | undefined => {
  if (votingPower === undefined || !totalDelegatedVotes) return undefined
  return Big(votingPower)
    .div(Big(formatEther(totalDelegatedVotes)))
    .times(100)
    .toFixed(2)
}

export const validateRnsDomain = async (
  domain: string,
  setDomainStatus: (status: string) => void = () => {},
) => {
  let returnObject = {
    domain,
    address: '',
    valid: false,
    error: '',
  }
  try {
    setDomainStatus('validating')
    const resolvedAddress = await resolveRnsDomain(domain)
    if (resolvedAddress) {
      returnObject.domain = domain
      returnObject.address = resolvedAddress.toLowerCase()
      returnObject.valid = true
      setDomainStatus('valid')
    } else {
      setDomainStatus('invalid')
      returnObject.error = 'Invalid RNS domain'
    }
  } catch {
    setDomainStatus('invalid')
    returnObject.error = 'Error resolving RNS domain'
  }
  return returnObject
}
