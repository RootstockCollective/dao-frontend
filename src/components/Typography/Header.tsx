import { FC } from 'react'
import { EmphaseVariants, HeaderVariants, HtmlTypographyTag } from './types'
import { BaseTypography, BaseTypographyProps } from './Typography'

type HeaderVariant = EmphaseVariants | HeaderVariants

const elementByVariant: Record<HeaderVariant, HtmlTypographyTag> = {
  e1: 'h1',
  e2: 'h2',
  e3: 'h3',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
}

export interface HeaderProps extends Omit<BaseTypographyProps<HtmlTypographyTag>, 'as'> {
  variant?: HeaderVariant
}

/**
 * Header Component
 *
 * Renders a h1, h2, h3, h4, h5 element with consistent styling.
 *
 * @example
 * ```tsx
 * <Header variant="h1" caps>PROPOSALS</Header>
 * <Header variant="h3" className="text-white">LATEST PROPOSALS</Header>
 * ```
 *
 * Supports the following variants:
 * - e1: font-size: 60px; font-family: font-kk-topo - **Figma: Emphase/E1**
 * - e2: font-size: 44px; font-family: font-kk-topo - **Figma: Emphase/E2**
 * - e3: font-size: 16px; font-family: font-kk-topo - **Figma: Emphase/E3**
 * - h1 (default): font-size: 32px; font-family: font-kk-topo - **Figma: Header/H1**
 * - h2: font-size: 24px; font-family: font-kk-topo - **Figma: Header/H2**
 * - h3: font-size: 20px; font-family: font-kk-topo - **Figma: Header/H3**
 * - h4: font-size: 16px; font-family: font-rootstock-sans - **Figma: Header/H4**
 * - h5: font-size: 12px; font-family: font-rootstock-sans - **Figma: Header/H5**
 */
export const Header: FC<HeaderProps> = ({ variant = 'h1', children, 'data-testid': dataTestId, ...rest }) => (
  <BaseTypography as={elementByVariant[variant]} variant={variant} data-testid={dataTestId} {...rest}>
    {children}
  </BaseTypography>
)
