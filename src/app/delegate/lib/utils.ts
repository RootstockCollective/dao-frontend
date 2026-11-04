import { DELEGATES_DENYLIST } from '@/lib/constants'
import { resolveRnsDomain } from '@/lib/rns'

export const DENIED_DELEGATE_MESSAGE = 'This delegate is no longer active'

/** Whether an address or RNS domain is in the delegates denylist */
export const isDeniedDelegate = (addressOrDomain: string) =>
  DELEGATES_DENYLIST.includes(addressOrDomain.trim().toLowerCase())

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
