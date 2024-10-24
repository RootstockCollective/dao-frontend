import { Span } from '@/components/Typography'
import { HtmlHTMLAttributes } from 'react'

export type BadgeProps = { content: string; className: HtmlHTMLAttributes<HTMLSpanElement>['className'] }

export const Badge = ({ content, className }: BadgeProps) => {
  return (
    <Span
      className={`rounded-sm font-bold min-h-fit justify-center flex text-center gap-1 text-[14px] leading-none ${className}`}
    >
      {content}
    </Span>
  )
}
