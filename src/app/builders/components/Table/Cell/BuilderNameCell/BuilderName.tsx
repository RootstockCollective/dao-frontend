import { Paragraph } from '@/components/Typography'
import { Builder } from '@/app/collective-rewards/types'
import { cn, truncate } from '@/lib/utils'
import Link from 'next/link'

export interface BuilderNameProps {
  builder: Builder
  builderPageLink: string
  isHighlighted?: boolean
}

export const BuilderName = ({ builder, isHighlighted, builderPageLink }: BuilderNameProps) => {
  return (
    <Link href={builderPageLink} data-testid="builderName" target="_blank" rel="noopener noreferrer">
      <Paragraph
        className={cn(
          'text-v3-primary font-rootstock-sans',
          isHighlighted && 'text-v3-bg-accent-100 underline underline-offset-2',
        )}
      >
        {truncate(builder.builderName, 18)}
      </Paragraph>
    </Link>
  )
}
