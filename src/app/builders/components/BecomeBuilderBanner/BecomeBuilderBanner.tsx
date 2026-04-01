import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import Image from 'next/image'
import CollapsibleWithPreview from '@/components/CollapsibleWithPreview/CollapsibleWithPreview'
import { useRouter } from 'next/navigation'

const ExpandedContent = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col lg:flex-row gap-0 items-start h-full">
      {/* Left: Image */}
      <div className="relative overflow-hidden hidden lg:flex h-full min-h-[340px] basis-1/4 md:basis-1/4 flex-shrink-0 w-full transition-all duration-300 ease-in-out">
        <Image
          src="/images/become-a-builder-banner-big.png"
          alt="Become a Builder Banner"
          fill
          className="object-fill"
          priority
        />
      </div>
      {/* Center: Main Content */}
      <div className="flex flex-col text-base justify-center gap-4 basis-1/2 md:basis-1/2 md:mt-10">
        <div>
          <Header variant="h1" className="text-v3-text-0">
            BECOME A <br className="md:hidden" /> COLLECTIVE BUILDER. <br className="hidden md:block" />
          </Header>
          <Header variant="h1" className="text-v3-bg-accent-20">
            SECURE FUNDING.
            <br className="md:hidden" /> EARN
            <br className="md:hidden" /> CONTINUOUSLY.
          </Header>
        </div>
        <Paragraph className="text-v3-text-0">
          Join a growing network of innovators building the future of decentralised infrastructure. Get
          grants, earn rewards, and grow with the Collective.
        </Paragraph>
        <div className="gap-4 mt-2 lg:flex hidden">
          <Button
            variant="primary"
            onClick={() => router.push('/proposals/new?type=Builder')}
            data-testid="JoinBuilderRewardsButton"
          >
            Join Builder Rewards
          </Button>
          <Button
            variant="secondary-outline"
            onClick={() => router.push('/proposals/new?type=Grants')}
            textClassName="text-bg-100"
            data-testid="ApplyForGrantButton"
          >
            Apply for a Grant
          </Button>
        </div>
      </div>
      {/* Right: Why Become a Builder */}
      <div className="flex flex-col justify-center bg-transparent basis-1/4 md:basis-1/2 lg:basis-1/4 w-full lg:pl-8 mt-8 llg:mt-10">
        <Header variant="h3" className="text-v3-text-0 mb-4">
          WHY BECOME A BUILDER?
        </Header>
        <ul className="list-[circle] pl-5 text-v3-text-0">
          <li>
            <Paragraph>Join a mission-aligned network</Paragraph>
          </li>
          <li>
            <Paragraph>Earn performance-based rewards</Paragraph>
          </li>
          <li>
            <Paragraph>Access grants to kickstart your project</Paragraph>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 mt-6 lg:hidden w-full *:flex-1">
        <Button variant="primary" onClick={() => router.push('/proposals/new?type=Builder')} className="py-3">
          Join Rewards
        </Button>
        <Button
          variant="secondary-outline"
          onClick={() => router.push('/proposals/new?type=Grants')}
          textClassName="text-bg-100"
        >
          Apply for a Grant
        </Button>
      </div>
    </div>
  )
}

const CollapsedContent = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col text-base justify-center gap-4 basis-1/2 md:basis-1/2">
      <div>
        <Header variant="h1" className="text-v3-text-0">
          BECOME A <br className="md:hidden" /> COLLECTIVE BUILDER.
        </Header>
        <br />
        <Header variant="h1" className="text-v3-bg-accent-20 mt-2">
          SECURE FUNDING.
          <br className="md:hidden" /> EARN
          <br />
          CONTINUOUSLY.
        </Header>
      </div>
      <div className="flex gap-4 mt-2">
        <Button variant="primary" onClick={() => router.push('/proposals/new?type=Builder')} className="py-3">
          Join Rewards
        </Button>
        <Button
          variant="secondary-outline"
          onClick={() => router.push('/proposals/new?type=Grants')}
          textClassName="text-bg-100 whitespace-nowrap"
        >
          Apply for a Grant
        </Button>
      </div>
    </div>
  )
}

const BecomeBuilderBanner = () => {
  return (
    <>
      {/* Desktop version - always expanded, not collapsible */}
      <div className="hidden lg:block bg-v3-text-80 rounded-sm p-4">
        <ExpandedContent />
      </div>

      {/* Mobile/Tablet version - collapsible */}
      <div className="lg:hidden w-full">
        <CollapsibleWithPreview
          expandedContent={<ExpandedContent />}
          collapsedContent={<CollapsedContent />}
          expandedState={{
            backgroundColor: 'bg-v3-text-80',
            chevronColor: 'text-v3-bg-accent-100',
          }}
          collapsedState={{
            backgroundColor: 'bg-v3-text-80',
            chevronColor: 'text-v3-bg-accent-100',
          }}
          defaultOpen={false}
        />
      </div>
    </>
  )
}

export default BecomeBuilderBanner
