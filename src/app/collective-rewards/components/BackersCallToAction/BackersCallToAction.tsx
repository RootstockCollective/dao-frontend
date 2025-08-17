import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { useContext } from 'react'
import { useAccount } from 'wagmi'
import { Banner } from '../Banner'
import { BackersDecorativeSquares } from '../DecorativeSquares'
import { AllocationsContext } from '../../allocations/context'
import { CallToActionCard } from '../CallToActionCard'
import { ActiveBackers } from '../ActiveBackers'
import { FC } from 'react'
import { RewardsMetrics } from '../RewardsMetrics'
import { useRouter } from 'next/navigation'
import { StylableComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

const BackersBanner = () => (
  <Banner
    imageSrc="/images/cta-banner-backers.png"
    altText="Backers Call to Action Banner"
    DecorativeComponent={BackersDecorativeSquares}
  />
)

const BackersTitle = () => {
  return (
    <Header caps variant="e2" className="pt-2 pb-4 md:py-4 px-0 md:px-2">
      <div className="text-v3-text-0">Back Builders</div>
      <div className="text-v3-bg-accent-20">and be rewarded</div>
    </Header>
  )
}

const BackerCTAButton = ({ className }: StylableComponentProps<HTMLButtonElement>) => {
  const router = useRouter()
  const { isConnected } = useAccount()
  const {
    state: {
      backer: { balance: votingPower },
    },
  } = useContext(AllocationsContext)

  const hasStRIF = votingPower && votingPower > 0n

  if (!isConnected || hasStRIF) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          router.push('/backing')
        }}
        className={cn(className, 'w-full md:w-auto')}
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
      className={cn(className, 'w-full md:w-auto')}
    >
      Stake RIF
    </Button>
  )
}

interface BackersCallToActionProps {
  rifRewards: bigint
  rbtcRewards: bigint
  className?: string
}
export const BackersCallToAction: FC<BackersCallToActionProps> = ({ rifRewards, rbtcRewards }) => {
  const collapsibleContent = (
    <Paragraph className="text-v3-text-0 pb-6 px-0 md:px-2">
      Support the projects you believe in by backing Builders with your stRIF. Earn rewards while helping
      shape the future of Bitcoin Layer 2.
    </Paragraph>
  )

  return (
    <CallToActionCard className="bg-v3-text-80 rounded-sm p-4" defaultOpen={true}>
      <CallToActionCard.Banner>
        <BackersBanner />
      </CallToActionCard.Banner>
      <CallToActionCard.Toggle />
      <CallToActionCard.Content>
        <BackersTitle />
      </CallToActionCard.Content>
      <CallToActionCard.Content className="order-3 md:order-1 pt-6 md:pb-8 md:pt-0">
        <BackerCTAButton />
      </CallToActionCard.Content>
      <CallToActionCard.Collapsible className="order-1 md:order-2">
        {collapsibleContent}
      </CallToActionCard.Collapsible>
      <CallToActionCard.Content className="order-2 md:order-3">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
          <RewardsMetrics
            title="Upcoming Rewards for Backers"
            rbtcRewards={rbtcRewards}
            rifRewards={rifRewards}
          />
          <ActiveBackers />
        </div>
      </CallToActionCard.Content>
    </CallToActionCard>
  )
}
