import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { Span } from '../TypographyNew'

export const DottedUnderlineLabel: FC<CommonComponentProps> = ({ className = '', children }) => {
  return (
    <Span
      variant="body-l"
      className={cn('underline decoration-dotted decoration-[0.2rem] underline-offset-4', className)}
      style={{
        textDecorationSkipInk: 'auto',
        textUnderlinePosition: 'from-font',
      }}
      bold
    >
      {children}
    </Span>
  )
}
