import { Paragraph, Span } from '@/components/Typography'
import Image from 'next/image'
import { BsArrowUpRight } from 'react-icons/bs'
import Link from 'next/link'

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
    <Link href={`/communities/nft/${nftAddress}`}>
      <div className="flex mb-[22px] items-center">
        <div className="rounded-full overflow-hidden">
          <Image src={leftImageSrc} alt={title} width={50} height={50} />
        </div>
        <div className="flex-1 flex flex-col ml-[12px]">
          <Span>{title}</Span>
          <Span size="small" variant="light">
            {subtitle}
          </Span>
        </div>
        <BsArrowUpRight />
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
    </Link>
  </div>
)
