import { HeaderTitle, Paragraph } from '@/components/Typography'

export interface HeroItemProps {
  title: string
  description: string
  children: React.ReactNode
}

export const HeroItem = ({ title, description, children }: HeroItemProps) => {
  return (
    <div
      className="flex flex-col gap-[16px] justify-between h-full p-[16px] bg-[#1A1A1A] border-[1px] border-[#2B2B2B]"
      data-testid={`${title}Card`}
    >
      <HeaderTitle>{title}</HeaderTitle>
      <Paragraph variant="normal" className="mb-[8px] text-[14px]">
        {description}
      </Paragraph>
      <div>{children}</div>
    </div>
  )
}
