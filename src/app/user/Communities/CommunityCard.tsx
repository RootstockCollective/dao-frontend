import { Paragraph } from '@/components/Typography/Paragraph'
import { FC } from 'react'
import { CommunityCardProps } from '@/app/user/types'
import Image from 'next/image'

export const CommunityCard: FC<CommunityCardProps> = ({ img, title, description, members }) => (
  <div className='rounded bg-input-bg px-[14px] py-[14px]'>
    {/* image */}
    <Image src={`data:image/png;base64, ${img}`} alt='An image that contains a community logo' className='w-full mb-[20px]' width={300} height={300} />
    {/* community title */}
    <Paragraph className='text-[18px]'>{title}</Paragraph>
    {/* description */}
    <Paragraph variant='light' className='text-[12px]'>{description}</Paragraph>
    {/* members */}
  </div>
)
