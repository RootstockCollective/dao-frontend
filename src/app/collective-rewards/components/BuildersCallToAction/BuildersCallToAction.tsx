import { Header, Paragraph } from '@/components/TypographyNew'
import { MetricsContainer } from '@/components/containers'
import { Button } from '@/components/ButtonNew/Button'
import { useAccount } from 'wagmi'
import { zeroAddress } from 'viem'
import { Banner } from '../Banner'
import { BuildersDecorativeSquares } from '../DecorativeSquares'
import { useBuilderContext } from '../../user'
import { CallToActionCard } from '../CallToActionCard'
import { ActiveBuilders } from '../ActiveBuilders'
import { FC } from 'react'
import { RewardsMetrics } from '../RewardsMetrics'
import { useRouter } from 'next/navigation'

const BuildersBanner = () => (
  <Banner
    imageSrc="/images/cta-banner-builders.png"
    altText="Builders Call to Action Banner"
    DecorativeComponent={BuildersDecorativeSquares}
  />
)

const BuildersTitle = () => {
  return (
    <Header caps variant="e2" className="px-6 py-4">
      <div className="text-v3-bg-accent-20">Be rewarded</div>
      <div className="text-v3-text-0">for building</div>
    </Header>
  )
}

const BuilderCTAButton = () => {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { getBuilderByAddress, isLoading: builderLoading, error: builderLoadingError } = useBuilderContext()

  const builder = getBuilderByAddress(address ?? zeroAddress)

  if (!isConnected || !builder) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          router.push('/builders')
        }}
      >
        Become a Builder
      </Button>
    )
  }

  // TODO: Add link to get a grant
  return <Button variant="secondary">Get a Grant</Button>
}

interface BuildersCallToActionProps {
  rifRewards: bigint
  rbtcRewards: bigint
}

export const BuildersCallToAction: FC<BuildersCallToActionProps> = ({ rifRewards, rbtcRewards }) => {
  return (
    <CallToActionCard title={<BuildersTitle />} banner={<BuildersBanner />}>
      <MetricsContainer className="px-6 pb-10 pt-0 bg-v3-text-80 items-start divide-y-0">
        <BuilderCTAButton />
        <Paragraph className="text-v3-text-0">
          Join the Collective as a Builder and earn for delivering impact. Be part of Bitcoin’s most aligned
          innovation network.
        </Paragraph>
        <div className="flex flex-row gap-2 w-full">
          <RewardsMetrics
            title="Upcoming Rewards for Builders"
            rbtcRewards={rbtcRewards}
            rifRewards={rifRewards}
          />
          <ActiveBuilders />
        </div>
      </MetricsContainer>
    </CallToActionCard>
  )
}
