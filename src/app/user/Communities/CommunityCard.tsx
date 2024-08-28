import { Paragraph } from '@/components/Typography/Paragraph'
import { FC } from 'react'
import { CommunityCardProps } from '@/app/user/types'
import Image from 'next/image'

export const CommunityCard: FC<CommunityCardProps> = ({ img, title, description, members }) => (
  <div className="rounded bg-input-bg px-[14px] py-[14px] w-[300px]">
    {/* image */}
    <Image
      src={img}
      alt="An image that contains a community logo"
      className="mb-[20px]"
      width={300}
      height={300}
    />
    {/* community title */}
    <Paragraph className="text-[18px] mb-[5px]">{title}</Paragraph>
    {/* description */}
    <Paragraph className="text-[14px] font-normal">{description}</Paragraph>
    {/* members */}
    <Paragraph className="text-[14px] mt-[7px]">{members} members</Paragraph>
  </div>
)
