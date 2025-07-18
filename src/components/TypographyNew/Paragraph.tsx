import { FC } from 'react'
import { BodyVariants } from './types'
import { Typography, TypographyProps } from './Typography'

interface Props extends Omit<TypographyProps<'p'>, 'as'> {
  variant?: BodyVariants
}

/**
 * Paragraph Component
 *
 * Renders a <p> element with consistent styling.
 * Supports the following variants:
 * - body-l: font-size: 18px; font-family: font-rootstock-sans
 * - body: font-size: 16px; font-family: font-rootstock-sans
 * - body-s: font-size: 14px; font-family: font-rootstock-sans
 * - body-xs: font-size: 12px; font-family: font-rootstock-sans
 */
export const Paragraph: FC<Props> = ({
  variant = 'body',
  children,
  'data-testid': dataTestId = '',
  ...rest
}) => (
  <Typography as="p" variant={variant} data-testid={`Paragraph${dataTestId}`} {...rest}>
    {children}
  </Typography>
)
