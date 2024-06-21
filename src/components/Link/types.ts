import type { AnchorHTMLAttributes, ElementType } from 'react'
import { LinkProps as NextLinkProps } from 'next/link'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'menu'
  component?: ElementType
}

export type LinkProps = ExternalLinkProps & NextLinkProps
