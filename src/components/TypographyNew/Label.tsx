import { FC } from 'react'
import { BodyVariants, TagVariants } from './types'
import { Typography, TypographyProps } from './Typography'

type LabelVariant = BodyVariants | TagVariants

interface Props extends Omit<TypographyProps<'label'>, 'as'> {
  variant?: LabelVariant
}

export const Label: FC<Props> = ({ children, variant = 'body', 'data-testid': dataTestId = '', ...rest }) => (
  <Typography as="label" variant={variant} data-testid={dataTestId} {...rest}>
    {children}
  </Typography>
)
