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
 *
 * @example
 * ```tsx
 * <Label variant="tag">Username</Label>
 * <Label variant="body-s" bold>Status</Label>
 * ```
 *
 * Supports the following variants:
 *
 * **Tag Variants:**
 * - tag: font-size: 16px; font-weight: 600; font-family: font-rootstock-sans - **Figma: Tags/T Regular**
 * - tag-s: font-size: 14px; font-weight: 600; font-family: font-rootstock-sans - **Figma: Tags/TS**
 *
 * **Body Variants:**
 * - body-l: font-size: 18px; font-weight: 400; font-family: font-rootstock-sans - **Figma: Body/BL Regular**
 * - body (default): font-size: 16px; font-weight: 400; font-family: font-rootstock-sans - **Figma: Body/B Regular**
 * - body-s: font-size: 14px; font-weight: 400; font-family: font-rootstock-sans - **Figma: Body/BS Regular**
 * - body-xs: font-size: 12px; font-weight: 400; font-family: font-rootstock-sans - **Figma: Body/BXS Regular**
 *
 * All variants support the `bold`, `caps`, and `html` props.
 */
export const Label: FC<Props> = ({ children, variant = 'body', 'data-testid': dataTestId = '', ...rest }) => (
  <BaseTypography as="label" variant={variant} data-testid={dataTestId} {...rest}>
    {children}
  </BaseTypography>
)

export type LabelProps = Props
