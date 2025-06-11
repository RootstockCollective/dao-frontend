import { Paragraph } from '@/components/Typography/Paragraph'
import { Link } from '@/components/Link'
import { currentLinks } from '@/components/LeftSidebar/links'
import { TokenImage } from '../TokenImage'

export const UsefulLinks = () => (
  <div className="mt-[4rem]">
    <Paragraph className="text-[16px] font-bold">Useful links</Paragraph>
    <div className="flex flex-col pl-[16px] mt-[24px]">
      <Link
        href={currentLinks.rif}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="RIFLink"
      >
        RIF
      </Link>
      <Link
        href={currentLinks.forum}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="ForumLink"
      >
        Forum
      </Link>
      <Link
        href={currentLinks.getRif}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="GetRIFLink"
      >
        <div className="inline-flex">
          Get RIF
          <TokenImage className={'ml-[4px]'} symbol={'RIF'} size={16} />
        </div>
      </Link>
      <Link
        href={currentLinks.rbtc}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="GetRBTCLink"
      >
        <div className="inline-flex">
          Get RBTC
          <TokenImage className={'ml-[4px]'} symbol={'RBTC'} size={16} />
        </div>
      </Link>
      <Link
        href={currentLinks.registerRns}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="GetRNSDomainLink"
      >
        Get RNS Domain
      </Link>
      <Link
        href={currentLinks.feedbackForm}
        variant="menu"
        className="mt-[16px] text-[14px]"
        target="_blank"
        data-testid="GetRNSDomainLink"
      >
        Submit Feedback
      </Link>
    </div>
  </div>
)
