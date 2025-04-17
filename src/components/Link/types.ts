import type { AnchorHTMLAttributes, ElementType } from 'react'
import { LinkProps as NextLinkProps } from 'next/link'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'menu' | 'section-header'
  component?: ElementType
}

export type LinkProps = ExternalLinkProps & NextLinkProps
