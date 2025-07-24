import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Label, Paragraph } from '@/components/TypographyNew'
import Link from 'next/link'

interface Props extends React.PropsWithChildren {
  header: string
  url: string
}

export function CardParagraph({ header, url, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Link href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
        <div className="flex gap-1 items-center">
          <Label className="text-bg-100" bold>
            {header}
          </Label>
          <ArrowUpRightLightIcon size={20} strokeWidth="1.8" className="text-bg-100" />
        </div>
      </Link>
      <Paragraph className="text-bg-100">{children}</Paragraph>
    </div>
  )
}
