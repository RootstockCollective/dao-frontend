import { AddrResolver } from '@rsksmart/rns-sdk'
import { RNS_REGISTRY_ADDRESS, NODE_URL } from '@/lib/constants'

export const resolveRnsDomain = async (domain: string) => {
  const addrResolver = new AddrResolver(RNS_REGISTRY_ADDRESS, NODE_URL as string)
  try {
    const addr = await addrResolver.addr(domain)
    return addr
  } catch (error) {
    throw new Error('Error resolving RNS domain')
  }
}
