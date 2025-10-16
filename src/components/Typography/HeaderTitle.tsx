import { Header, type HeaderProps } from './Header'

export const HeaderTitle = ({ children, ...props }: HeaderProps) => (
  <Header className="mb-8 md:mb-10" variant="h2" caps {...props}>
    {children}
  </Header>
)
