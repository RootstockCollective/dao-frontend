import { Button } from '@/components/Button'
import { Paragraph, Span } from '@/components/Typography'
import Image from 'next/image'
import { BsArrowUpRight } from 'react-icons/bs'
import { VscChevronUp } from 'react-icons/vsc'

interface CommunityItemProps {
  leftImageSrc: string
  title: string
  subtitle: string
  nftAddress: string
  description: string
  numberOfMembers: number
}

export const CommunityItem = ({
  leftImageSrc,
  title,
  subtitle,
  nftAddress,
  description,
  numberOfMembers,
}: CommunityItemProps) => (
  <div className="rounded-[8px] bg-input-bg p-[16px] w-[324px]">
    <div className="flex mb-[22px] items-center">
      <Image src={leftImageSrc} alt={title} width={50} height={33} />
      <div className="flex-1 flex flex-col ml-[12px]">
        <Span>{title}</Span>
        <Span size="small" variant="light">
          {subtitle}
        </Span>
      </div>
      <div>
        <BsArrowUpRight
          onClick={() => window.open(`/communities/nft/${nftAddress}`, '_blank')}
          className="cursor-pointer"
        />
      </div>
    </div>
    <Paragraph variant="normal" className="mb-[8px] text-[14px]">
      {description}
    </Paragraph>
    <div />
    {/* Divider */}
    {/*<div className="flex justify-end">*/}
    {/*  <Button variant="white" startIcon={<VscChevronUp />}>*/}
    {/*    {numberOfMembers.toString()}*/}
    {/*  </Button>*/}
    {/*</div>*/}
  </div>
)
