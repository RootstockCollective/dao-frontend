import { FC } from 'react'
import { BodyVariants } from './types'
import { Typography, TypographyProps } from './Typography'

interface Props extends Omit<TypographyProps<'p'>, 'as'> {
  variant?: BodyVariants
}

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
