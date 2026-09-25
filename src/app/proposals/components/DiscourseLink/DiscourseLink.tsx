import Link from 'next/link'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { currentLinks } from '@/lib/links'

/** Link to the governance forum, styled like the other banner links. */
export const DiscourseLink = ({ children, ...props }: CommonComponentProps<HTMLAnchorElement>) => (
  <Link
    href={currentLinks.forum}
    className="inline-flex items-center gap-1 no-underline hover:underline"
    target="_blank"
    rel="noopener noreferrer"
    data-testid="DiscourseLink"
    {...props}
  >
    {children}
    <ArrowUpRightLightIcon size={20} />
  </Link>
)
