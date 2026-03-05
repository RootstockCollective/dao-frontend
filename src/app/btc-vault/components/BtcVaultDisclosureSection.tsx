'use client'

import { useAccount } from 'wagmi'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { DisclosureContent } from './DisclosureContent'

/**
 * Renders the DISCLOSURE section at the bottom of the BTC Vault page when the user is connected.
 * When disconnected, returns null (disclosure is shown as a banner at top instead).
 */
export const BtcVaultDisclosureSection = () => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return null
  }

  return (
    <SectionContainer
      title="DISCLOSURE"
      headerVariant="h3"
      className="w-full"
      contentClassName="mt-4"
      data-testid="BtcVaultDisclosureSection"
    >
      <DisclosureContent />
    </SectionContainer>
  )
}
