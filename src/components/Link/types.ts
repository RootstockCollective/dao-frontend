import { LinkProps as NextLinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ElementType } from 'react'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'menu' | 'section-header' | 'hero'
  component?: ElementType
  underline?: boolean
}

export type LinkProps = ExternalLinkProps & NextLinkProps
