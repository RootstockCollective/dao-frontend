import { DelegateContextProvider } from '@/app/delegate/contexts/DelegateContext'
import { DelegateContentSection, VotingPowerSection } from '@/app/delegate/sections'
import { HeroComponent } from '@/components/HeroComponent'

export default function Delegate() {
  return (
    <DelegateContextProvider>
      <div className="mt-6">
        <HeroComponent
          imageBannerSrc="/images/hero/delegation-banner.svg"
          imageSquaresSrc="/images/hero/delegation-squares.svg"
          title="DELEGATE YOUR VOTING POWER"
          subtitle="TO INFLUENCE WHAT GETS BUILT"
          items={[
            'you are only delegating your own voting power',
            'your coins stay in your wallet',
            'you save on gas cost while being represented',
            'your Rewards will keep accumulating as usual',
          ]}
        />
      </div>
      <VotingPowerSection />
      <DelegateContentSection />
    </DelegateContextProvider>
  )
}
