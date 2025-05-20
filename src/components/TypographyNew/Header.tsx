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

interface Props extends Omit<TypographyProps, 'as'> {
  variant?: HeaderVariant
}

export const Header: FC<Props> = ({ variant = 'h1', children, 'data-testid': dataTestId = '', ...rest }) => (
  <Typography as={elementByVariant[variant]} variant={variant} data-testid={`Header${dataTestId}`} {...rest}>
    {children}
  </Typography>
)
