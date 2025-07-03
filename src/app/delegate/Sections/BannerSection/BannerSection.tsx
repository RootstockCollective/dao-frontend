'use client'
import { useDelegateContext } from '@/app/delegate/components/DelegateContext'
import { BannerDelegate } from '@/components/Banner/BannerDelegate'
import { useAccount } from 'wagmi'

export const BannerSection = () => {
  const { didIDelegateToMyself } = useDelegateContext()
  const { isConnected } = useAccount()

  const shouldShowBanner = !isConnected || didIDelegateToMyself

  return <div className="mb-[8px]">{shouldShowBanner && <BannerDelegate />}</div>
}
