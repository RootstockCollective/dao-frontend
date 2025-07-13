import { ReactNode } from 'react'
import { Header } from '@/components/TypographyNew'

interface SectionContainerProps {
  title: string
  rightContent?: ReactNode
  children: ReactNode
}

export const SectionContainer = ({ title, rightContent, children }: SectionContainerProps) => (
  <div className="bg-bg-80 p-[24px] rounded">
    <div className="flex flex-row justify-stretch mb-[40px]">
      <Header className="flex-1">{title}</Header>
      <p className="flex-1">{rightContent}</p>
    </div>
    <div data-testid="SectionContainerContent">{children}</div>
  </div>
)
