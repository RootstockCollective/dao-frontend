import { FC } from 'react'
import { BodyVariants, TagVariants } from './types'
import { BaseTypography, BaseTypographyProps } from './Typography'

type LabelVariant = BodyVariants | TagVariants

interface Props extends Omit<BaseTypographyProps<'label'>, 'as'> {
  variant?: LabelVariant
}

/**
 * Label Component
 *
 * Renders a <label> element with consistent styling.
 * Supports the following variants:
 * - tag: font-size: 16px; font-weight: 600; font-family: font-rootstock-sans
 * - tag-s: font-size: 14px; font-weight: 600; font-family: font-rootstock-sans
 * - tag-m: font-size: 14px; font-weight: 600; font-family: font-rootstock-sans
 * - body-l: font-size: 18px; font-weight: 400; font-family: font-rootstock-sans
 * - body (default): font-size: 16px; font-weight: 400; font-family: font-rootstock-sans
 * - body-s: font-size: 14px; font-weight: 400; font-family: font-rootstock-sans
 * - body-xs: font-size: 12px; font-weight: 400; font-family: font-rootstock-sans
 */
export const Label: FC<Props> = ({ children, variant = 'body', 'data-testid': dataTestId = '', ...rest }) => (
  <BaseTypography as="label" variant={variant} data-testid={dataTestId} {...rest}>
    {children}
  </BaseTypography>
)
