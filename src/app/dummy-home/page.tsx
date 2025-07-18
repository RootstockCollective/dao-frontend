'use client'
import { HeroComponent } from '@/components/HeroComponent'
import { useGetProposalsWithGraph } from '../proposals/hooks/useGetProposalsWithGraph'
import { LatestCollectiveSection } from '../user/latest-collective'
import { Header, Paragraph } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { ExternalLink } from '@/components/Link/ExternalLink'

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

export default function DummyHome() {
  const { activeProposals, data } = useGetProposalsWithGraph()

  return (
    <div className="bg-bg-100 px-6">
      <HeroComponent
        imageSrc="/images/hero/home-hero-top.png"
        title={'THE COLLECTIVE'}
        subtitle={'POSSIBILITIES'}
        topText="DON'T MISS"
        content={<TopHeroContent />}
        button={<Button>{'Connect wallet'}</Button>}
      />
      <LatestCollectiveSection latestProposals={data.slice(0, 3)} activeProposal={activeProposals[0]} />
      <HeroComponent
        className="mt-2"
        imageSrc="/images/hero/home-hero-bottom.png"
        title={'BE PART OF THE COMMUNITIES'}
        subtitle="CURATED BY THE COLLECTIVE"
        items={[
          'Collective Badges are dynamic NFTs that represent your role and impact within the DAO.',
          'Whether you’re a Builder, Backer, or Community Contributor, your badge shows that you belong.',
          'Be part of something bigger, helping shape the future of Bitcoin.',
          'These aren’t just collectibles. They are your passport to participation.',
        ]}
        button={
          <ExternalLink href="/communities" variant="hero" underline={false}>
            <Paragraph variant="body-s" className="text-black">
              Learn more
            </Paragraph>
          </ExternalLink>
        }
      />
    </div>
  )
}
