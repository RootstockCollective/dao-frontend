import { ArrowUpRightLightIcon } from '@/components/Icons'
import { Label, Paragraph } from '@/components/Typography'
import Link from 'next/link'

interface Props extends React.PropsWithChildren {
  header: string
  url: string
  'data-testid'?: string
}

export function CardParagraph({ header, url, children, 'data-testid': dataTestId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        data-testid={dataTestId}
      >
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
