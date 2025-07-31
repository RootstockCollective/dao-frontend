import { Header, Paragraph } from '@/components/TypographyNew'
import { MetricsContainer } from '@/components/containers'
import { Button } from '@/components/ButtonNew/Button'
import { useAccount } from 'wagmi'
import { Banner } from '../Banner'
import { BackersDecorativeSquares } from '../DecorativeSquares'
import { useAllocationsContext } from '@/app/context'
import { CallToActionCard } from '../CallToActionCard'
import { ActiveBackers } from '../ActiveBackers/ActiveBackers'
import { FC } from 'react'
import { RewardsMetrics } from '../RewardsMetrics'
import { useRouter } from 'next/navigation'

const BackersBanner = () => (
  <Banner
    imageSrc="/images/cta-banner-backers.png"
    altText="Backers Call to Action Banner"
    DecorativeComponent={BackersDecorativeSquares}
  />
)

const BackersTitle = () => {
  return (
    <Header caps variant="e2" className="px-6 py-4">
      <div className="text-v3-text-0">Back Builders</div>
      <div className="text-v3-bg-accent-20">and be rewarded</div>
    </Header>
  )
}

const BackerCTAButton = () => {
  const router = useRouter()
  const { isConnected } = useAccount()
  const {
    state: {
      backer: { balance: votingPower },
    },
  } = useAllocationsContext()

  const hasStRIF = votingPower && votingPower > 0n

  if (!isConnected || hasStRIF) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          router.push('/backing')
        }}
      >
        Back Builders
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        router.push('/')
      }}
    >
      Stake RIF
    </Button>
  )
}

interface BackersCallToActionProps {
  rifRewards: bigint
  rbtcRewards: bigint
}
export const BackersCallToAction: FC<BackersCallToActionProps> = ({ rifRewards, rbtcRewards }) => {
  return (
    <CallToActionCard
      title={<BackersTitle />}
      banner={<BackersBanner />}
      className="bg-v3-text-80 rounded-sm"
    >
      <MetricsContainer className="px-6 pb-10 pt-0 bg-v3-text-80 items-start divide-y-0">
        <BackerCTAButton />
        <Paragraph className="text-v3-text-0">
          Support the projects you believe in by backing Builders with your stRIF. Earn rewards while helping
          shape the future of Bitcoin Layer 2.
        </Paragraph>
        <div className="flex flex-row gap-2 w-full">
          <RewardsMetrics
            title="Upcoming Rewards for Backers"
            rbtcRewards={rbtcRewards}
            rifRewards={rifRewards}
          />
          <ActiveBackers />
        </div>
      </MetricsContainer>
    </CallToActionCard>
  )
}
