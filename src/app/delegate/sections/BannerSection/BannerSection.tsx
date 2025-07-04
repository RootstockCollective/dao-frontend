'use client'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { BannerDelegate } from '@/components/Banner/BannerDelegate'
import { useAccount } from 'wagmi'

export const BannerSection = () => {
  const { didIDelegateToMyself } = useDelegateContext()
  const { isConnected } = useAccount()

  const shouldShowBanner = !isConnected || didIDelegateToMyself

  return (
    <div className="mb-[8px]" data-testid="delegateBannerSection">
      {shouldShowBanner && <BannerDelegate />}
    </div>
  )
}
