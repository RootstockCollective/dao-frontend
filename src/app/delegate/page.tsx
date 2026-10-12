import { DelegationBanner } from '@/app/delegate/components/DelegationBanner'
import { WhyDelegate } from '@/app/delegate/components/WhyDelegate'
import { DelegateContextProvider } from '@/app/delegate/contexts/DelegateContext'
import { DelegateContentSection, VotingPowerSection } from '@/app/delegate/sections'

export default function Delegate() {
  return (
    <DelegateContextProvider>
      <div className="mb-2 flex flex-col gap-2">
        <DelegationBanner />
        <WhyDelegate />
        <VotingPowerSection />
      </div>
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
