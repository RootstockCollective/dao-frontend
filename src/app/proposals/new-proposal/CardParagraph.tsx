import { ArrowUpRightLightIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props extends React.PropsWithChildren {
  header: string
  url: string
}

const baseClasses = 'font-rootstock-sans text-bg-100 text-base leading-normal tracking-normal'

export function CardParagraph({ header, url, children }: Props) {
  return (
    <div className="flex flex-col gap-[10px]">
      <Link href={url}>
        <div className="flex gap-1 items-center">
          <h4 className={cn(baseClasses, 'font-bold')}>{header}</h4>
          <ArrowUpRightLightIcon size={20} strokeWidth="1.8" className="text-bg-100" />
        </div>
      </Link>
      <div className={cn(baseClasses, 'font-normal')}>{children}</div>
    </div>
  )
}
