import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

export function Card({ title, children, className, ...props }: Props) {
  return (
    <div className={cn('w-full flex flex-col gap-2', className)} {...props}>
      <Typography className="font-medium text-bg-0">{title}</Typography>
      <Typography>{children}</Typography>
    </div>
  )
}
