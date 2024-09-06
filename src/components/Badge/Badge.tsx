import { Span } from '@/components/Typography'

export type BadgeProps = { status: string; bgColor: string }

export const Badge = ({ status, bgColor }: BadgeProps) => {
  return <Span className={`rounded-md px-4 pt-1 pb-1 text-xs ${bgColor}`}>{status}</Span>
}
