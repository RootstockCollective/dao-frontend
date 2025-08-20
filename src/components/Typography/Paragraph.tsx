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
 *
 * @example
 * ```tsx
 * <Paragraph variant="body">Regular paragraph text</Paragraph>
 * <Paragraph variant="body-s" bold>Bold small text</Paragraph>
 * ```
 *
 * Supports the following variants:
 * - body-l: font-size: 18px; font-family: font-rootstock-sans - **Figma: Body/BL Regular**
 * - body (default): font-size: 16px; font-family: font-rootstock-sans - **Figma: Body/B Regular**
 * - body-s: font-size: 14px; font-family: font-rootstock-sans - **Figma: Body/BS Regular**
 * - body-xs: font-size: 12px; font-family: font-rootstock-sans - **Figma: Body/BXS Regular**
 *
 * All variants support the `bold` prop for bold text.
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
