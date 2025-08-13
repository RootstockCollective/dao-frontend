import { FC } from 'react'
import { BodyVariants } from './types'
import { BaseTypography, BaseTypographyProps } from './Typography'

interface Props extends Omit<BaseTypographyProps<'p'>, 'as'> {
  variant?: BodyVariants
}

/**
 * Paragraph Component
 *
 * Renders a <p> element with consistent styling.
 * Supports the following variants:
 * - body-l: font-size: 18px; font-family: font-rootstock-sans
 * - body (default): font-size: 16px; font-family: font-rootstock-sans
 * - body-s: font-size: 14px; font-family: font-rootstock-sans
 * - body-xs: font-size: 12px; font-family: font-rootstock-sans
 */
export const Paragraph: FC<Props> = ({
  variant = 'body',
  children,
  'data-testid': dataTestId = '',
  ...rest
}) => (
  <BaseTypography as="p" variant={variant} data-testid={`Paragraph${dataTestId}`} {...rest}>
    {children}
  </BaseTypography>
)
