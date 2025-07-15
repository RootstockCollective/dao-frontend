import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

export function Card({ title, children, className, ...props }: Props) {
  return (
    <div className={cn('w-full flex flex-col gap-2', className)} {...props}>
      <div className="text-base font-medium text-bg-0 leading-normal font-rootstock-sans">{title}</div>
      <div className="font-rootstock-sans text-text-100 leading-normal font-normal text-base">{children}</div>
    </div>
  )
}
