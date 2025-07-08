import { Header, HeaderProps } from '../TypographyNew'

export const HeaderTitle = ({ children, ...props }: HeaderProps) => (
  <Header variant="h2" caps {...props}>
    {children}
  </Header>
)
