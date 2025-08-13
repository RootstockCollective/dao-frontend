import { Header, Paragraph } from '@/components/Typography'
import { MetricsContainer } from '@/components/containers'
import { Button } from '@/components/Button'
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
import { StylableComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

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

const BuilderCTAButton = ({ className }: StylableComponentProps<HTMLButtonElement>) => {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { getBuilderByAddress, isLoading: builderLoading, error: builderLoadingError } = useBuilderContext()

  const builder = getBuilderByAddress(address ?? zeroAddress)

  if (!isConnected || !builder) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          router.push('/proposals/new?type=Builder')
        }}
        className={cn(className, 'w-full md:w-auto')}
      >
        Join Builders Rewards
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        router.push('/proposals/new?type=Grants')
      }}
      className={cn(className, 'w-full md:w-auto')}
    >
      Apply for a Grant
    </Button>
  )
}

interface BuildersCallToActionProps {
  rifRewards: bigint
  rbtcRewards: bigint
  className?: string
}

export const BuildersCallToAction: FC<BuildersCallToActionProps> = ({ rifRewards, rbtcRewards }) => {
  const collapsibleContent = (
    <Paragraph className="text-v3-text-0 order-2 px-6 pb-6">
      Join the Collective as a Builder and earn for delivering impact. Be part of Bitcoin&apos;s most aligned
      innovation network.
    </Paragraph>
  )

  return (
    <CallToActionCard
      title={<BuildersTitle />}
      banner={<BuildersBanner />}
      className="bg-v3-text-80"
      collapsibleContent={collapsibleContent}
      defaultOpen={true}
    >
      <MetricsContainer className="px-6 pb-10 pt-0 bg-v3-text-80 items-start divide-y-0 gap-6 md:gap-8">
        <BuilderCTAButton className="order-3 md:order-1" />
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full order-2">
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
