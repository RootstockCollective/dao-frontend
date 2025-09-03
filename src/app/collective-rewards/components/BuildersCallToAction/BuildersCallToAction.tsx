import { Button } from '@/components/Button'
import { Collapsible } from '@/components/Collapsible'
import { StylableComponentProps } from '@/components/commonProps'
import { Header, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useBuilderContext } from '../../user'
import { ActiveBuilders } from '../ActiveBuilders'
import { Banner } from '../Banner'
import { BuildersDecorativeSquares } from '../DecorativeSquares'
import { RewardsMetrics } from '../RewardsMetrics'

const BuildersBanner = () => (
  <Banner
    imageSrc="/images/cta-banner-builders.png"
    altText="Builders Call to Action Banner"
    DecorativeComponent={BuildersDecorativeSquares}
  />
)

const BuildersTitle = () => {
  return (
    <Header caps variant="e2" className="pt-2 pb-4 md:py-4 text-[2rem] md:text-[2.75rem]">
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

const collapsibleContent = (
  <Paragraph className="text-v3-text-0 order-2 pb-6">
    Join the Collective as a Builder and earn for delivering impact. Be part of Bitcoin&apos;s most aligned
    innovation network.
  </Paragraph>
)

export const BuildersCallToAction: FC<BuildersCallToActionProps> = ({ rifRewards, rbtcRewards }) => {
  return (
    <Collapsible.Root className="bg-v3-text-80 rounded-sm p-4" defaultOpen={false}>
      <div className="hidden md:block">
        <BuildersBanner />
      </div>
      <Collapsible.Toggle className="justify-end" />
      <div className="flex flex-col px-0 md:px-2">
        <div>
          <BuildersTitle />
        </div>
        <div className="order-3 md:order-1 pt-6 md:pb-8 md:pt-0">
          <BuilderCTAButton />
        </div>
        <Collapsible.Content className="order-1 md:order-2">{collapsibleContent}</Collapsible.Content>
        <div className="order-2 md:order-3">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
            <RewardsMetrics
              title="Upcoming Rewards for Builders"
              rbtcRewards={rbtcRewards}
              rifRewards={rifRewards}
            />
            <ActiveBuilders />
          </div>
        </div>
      </div>
    </Collapsible.Root>
  )
}
