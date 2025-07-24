import type { AnchorHTMLAttributes, ElementType } from 'react'
import { LinkProps as NextLinkProps } from 'next/link'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'menu' | 'section-header' | 'hero'
  component?: ElementType
  underline?: boolean
}

export type LinkProps = ExternalLinkProps & NextLinkProps
