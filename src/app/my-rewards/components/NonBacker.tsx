'use client'

import { Button } from '@/components/ButtonNew'
import { HeartBroken } from '@/components/Icons/v3design'
import { Paragraph } from '@/components/TypographyNew'
import { useRouter } from 'next/navigation'
import { BackerRewardsNotConnected } from '@/app/my-rewards/backers/components/BackerRewardsNotConnected'

export const NonBacker = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full pt-10 pb-10">
      <HeartBroken />
      <div className="flex flex-col items-center gap-1">
        <Paragraph className="text-center text-v3-text-100 font-rootstock-sans text-lg not-italic font-bold leading-6 ">
          You are not backing any builders yet.
        </Paragraph>
        <Paragraph className="text-center text-v3-text-60 font-rootstock-sans text-sm not-italic font-normal leading-5 ">
          Support builders by allocating your stRIF and start earning rewards.
        </Paragraph>
      </div>
      <Button variant="primary" onClick={() => router.push('/builders')}>
        See all Builders
      </Button>
    </div>
  )
}
