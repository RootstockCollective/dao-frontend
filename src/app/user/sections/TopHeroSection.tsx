import { Button } from '@/components/ButtonNew'
import { HeroComponent } from '@/components/HeroComponent'
import { Header, Paragraph } from '@/components/TypographyNew'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

interface TopHeroPossibilityProps {
  title: string
  desc: string
}

const TopHeroPossibility = ({ title, desc }: TopHeroPossibilityProps) => (
  <div className="flex flex-col mt-6">
    <Header variant="h2" className="text-black">
      {title.toUpperCase()}
    </Header>
    <Paragraph variant="body" className="text-black">
      {desc}
    </Paragraph>
  </div>
)

const TopHeroContent = () => (
  <div className="pt-4 pb-10">
    <TopHeroPossibility
      title="build"
      desc="Become a builder on the Rootstock blockchain by leveraging its EVM compatibility and familiar development tools."
    />
    <TopHeroPossibility
      title="earn"
      desc="Stake RIF and get voting rights and participation in the DAO's governance and decision-making process."
    />
    <TopHeroPossibility
      title="Participate"
      desc="Community proposals are discussed and voted on, determining actions such as grants or governance changes."
    />
  </div>
)

export const TopHeroComponentNotConnected = () => (
  <HeroComponent
    imageSrc="/images/hero/home-hero-top.png"
    title={'THE COLLECTIVE'}
    subtitle={'POSSIBILITIES'}
    topText="DON'T MISS"
    content={<TopHeroContent />}
    button={<ConnectWorkflow ConnectComponent={props => <Button {...props}>{'Connect wallet'}</Button>} />}
  />
)
