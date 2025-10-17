import { DelegateContextProvider } from '@/app/delegate/contexts/DelegateContext'
import { DelegateContentSection, VotingPowerSection } from '@/app/delegate/sections'
import { HeroComponent } from '@/components/HeroComponent'

export default function Delegate() {
  return (
    <DelegateContextProvider>
      <HeroComponent
        imageSrc="/images/hero/delegation-banner.png"
        title="DELEGATE YOUR VOTING POWER"
        subtitle="TO INFLUENCE WHAT GETS BUILT"
        items={[
          'You are only delegating your own voting power',
          'Your coins stay in your wallet',
          'You save on gas cost while being represented',
          'Your Rewards will keep accumulating as usual',
        ]}
        className="mt-6"
        dataTestId="HeroDelegateComponent"
      />
      <VotingPowerSection />
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
