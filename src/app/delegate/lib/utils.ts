import { resolveRnsDomain } from '@/lib/rns'

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
  } catch (err) {
    setDomainStatus('invalid')
    returnObject.error = 'Error resolving RNS domain'
  }
  return returnObject
}
