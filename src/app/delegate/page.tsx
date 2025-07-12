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
          'you are only delegating your own voting power',
          'your coins stay in your wallet',
          'you save on gas cost while being represented',
          'your Rewards will keep accumulating as usual',
        ]}
        className="mt-6"
      />
      <VotingPowerSection />
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
