import NextLink from 'next/link'

import { ExternalLink } from './ExternalLink'
import { LinkProps } from './types'

/**
 * Base link component uses Next.js router link
 */
export const Link = (props: LinkProps) => {
  return <ExternalLink {...props} component={NextLink} />
}
