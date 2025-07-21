import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

export function Card({ title, children, className, ...props }: Props) {
  return (
    <div className={cn('w-full flex flex-col gap-2', className)} {...props}>
      <Paragraph className="font-medium text-bg-0">{title}</Paragraph>
      <div>{children}</div>
    </div>
  )
}
