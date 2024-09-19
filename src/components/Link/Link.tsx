import { FC } from 'react'
import NextLink from 'next/link'
import { ExternalLink } from './ExternalLink'
import { LinkProps } from './types'

/**
 * Base link component uses Next.js router link
 */
export const Link: FC<LinkProps> = props => {
  return <ExternalLink {...props} component={NextLink} />
}
