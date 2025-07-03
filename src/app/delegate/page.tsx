'use client'
import { DelegateContextProvider } from '@/app/delegate/components/DelegateContext'
import { BannerSection } from '@/app/delegate/Sections/BannerSection/BannerSection'
import { VotingPowerSection } from '@/app/delegate/Sections/VotingPowerSection/VotingPowerSection'
import { Header } from '@/components/TypographyNew'
import { DelegateContentSection } from '@/app/delegate/Sections/DelegateContentSection/DelegateContentSection'

export default function Delegate() {
  return (
    <DelegateContextProvider>
      <Header className="text-[32px] mb-[40px]">DELEGATION</Header>
      <BannerSection />
      <VotingPowerSection />
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
