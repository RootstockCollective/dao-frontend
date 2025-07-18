import { FC } from 'react'
import { EmphaseVariants, HeaderVariants, TypographyElement } from './types'
import { Typography, TypographyProps } from './Typography'

type HeaderVariant = EmphaseVariants | HeaderVariants

const elementByVariant: Record<HeaderVariant, TypographyElement> = {
  e1: 'h1',
  e2: 'h2',
  e2m: 'h2',
  e3: 'h3',
  h1: 'h1',
  h1m: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
}

export interface HeaderProps extends Omit<TypographyProps<TypographyElement>, 'as'> {
  variant?: HeaderVariant
}

/**
 * Header Component
 *
 * Renders a <h1>, <h2>, <h3>, <h4>, <h5> element with consistent styling.
 * Supports the following variants:
 * - e1: font-size: 60px; font-family: font-kk-topo
 * - e2: font-size: 44px; font-family: font-kk-topo
 * - e2m: font-size: 40px; font-family: font-kk-topo
 * - e3: font-size: 16px; font-family: font-kk-topo
 * - h1: font-size: 32px; font-family: font-kk-topo
 * - h1m: font-size: 28px; font-family: font-kk-topo
 * - h2: font-size: 24px; font-family: font-kk-topo
 * - h3: font-size: 20px; font-family: font-kk-topo
 * - h4: font-size: 16px; font-family: font-rootstock-sans
 * - h5: font-size: 12px; font-family: font-rootstock-sans
 */
export const Header: FC<HeaderProps> = ({
  variant = 'h1',
  children,
  'data-testid': dataTestId = '',
  ...rest
}) => (
  <Typography as={elementByVariant[variant]} variant={variant} data-testid={`Header${dataTestId}`} {...rest}>
    {children}
  </Typography>
)
