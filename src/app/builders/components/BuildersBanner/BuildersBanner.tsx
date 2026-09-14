'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'

const BANNER_IMAGE_SRC = '/images/builders-banner-bg.webp'

export const BuildersBanner = ({ className }: CommonComponentProps) => {
  const router = useRouter()

  return (
    <PageBanner
      dataTestId="BuildersBanner"
      dismissible
      imageSrc={BANNER_IMAGE_SRC}
      eyebrow="Build on Rootstock"
      title="Builders"
      description="Join a growing network of innovators building the future of decentralised infrastructure."
      className={className}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
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
          data-testid="ApplyForGrantButton"
        >
          Apply for a Grant
        </Button>
      </div>
    </PageBanner>
  )
}
