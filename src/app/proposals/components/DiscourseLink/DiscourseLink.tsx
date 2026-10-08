import { CommonComponentProps } from '@/components/commonProps'
import { BannerLink } from '@/components/PageBanner'
import { currentLinks } from '@/lib/links'

/** Link to the governance forum. */
export const DiscourseLink = (props: CommonComponentProps<HTMLAnchorElement>) => (
  <BannerLink href={currentLinks.forum} data-testid="DiscourseLink" {...props} />
)
