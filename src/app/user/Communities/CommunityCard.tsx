import { Paragraph } from '@/components/Typography/Paragraph'
import { FC } from 'react'
import { CommunityCardProps } from '@/app/user/types'
import Image from 'next/image'
import Link from 'next/link'

export const CommunityCard: FC<CommunityCardProps> = ({ img, title, description, members, link }) => (
  <div className="rounded bg-input-bg w-[300px]">
    <Link href={link}>
      {/* image */}
      <Image
        src={img}
        alt="An image that contains a community logo"
        className="mb-[20px]"
        width={300}
        height={300}
      />
      {/* community title */}
      <Paragraph className="text-[18px] mb-[5px] px-[14px] uppercase break-words" fontFamily="kk-topo">
        {title.replace('ROOTSTOCKCOLLECTIVE', '')}
      </Paragraph>
      {/* description */}
      <Paragraph className="text-[14px] px-[14px]">{description}</Paragraph>
      {/* members */}
      <Paragraph className="text-[14px] mt-[7px] px-[14px] pb-[14px]">{members} members</Paragraph>
    </Link>
  </div>
)
