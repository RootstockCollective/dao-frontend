import { CommunityCardProps } from '@/app/user/types'
import { BoltSvg } from '@/components/BoltSvg'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { Paragraph } from '@/components/Typography/Paragraph'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FC } from 'react'

export const CommunityCard: FC<CommunityCardProps> = ({
  img,
  title,
  description,
  members,
  link,
  isBoosted,
  alt,
}) => {
  return (
    <div
      className={cn(
        'rounded bg-input-bg w-[300px]',
        isBoosted ? 'shadow-[0px_0px_20.799999237060547px_0px_rgba(192,247,255,0.43)]' : '',
      )}
      data-testid={`${title}Card`}
    >
      <Link href={link}>
        {/* image */}
        <img
          src={img}
          alt={alt ?? 'An image that contains a community logo'}
          className="mb-[20px]"
          width={300}
          height={300}
        />
        {/* community title */}

        <div className="inline-flex items-center gap-2">
          <GlowingLabel
            showGlow={isBoosted}
            className="text-[18px] pl-[14px] break-words font-normal font-kk-topo uppercase items-center"
          >
            {title.replace('RootstockCollective', '')}
          </GlowingLabel>
          {isBoosted && <BoltSvg showGlow />}
        </div>

        <Paragraph className="text-[14px] px-[14px]">{description}</Paragraph>
        {/* members */}
        <Paragraph className="text-[14px] mt-[7px] px-[14px] pb-[14px]">{members} members</Paragraph>
      </Link>
    </div>
  )
}
