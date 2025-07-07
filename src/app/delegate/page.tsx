import { DelegateContextProvider } from '@/app/delegate/contexts/DelegateContext'
import { BannerSection, VotingPowerSection, DelegateContentSection } from '@/app/delegate/sections'
import { Header } from '@/components/TypographyNew'

export default function Delegate() {
  return (
    <DelegateContextProvider>
      <Header className="text-[32px] mb-[40px]" data-testid="delegatePageHeader">
        DELEGATION
      </Header>
      <BannerSection />
      <VotingPowerSection />
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
