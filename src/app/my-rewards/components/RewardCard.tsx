import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface RewardCardProps extends CommonComponentProps {
  isLoading: boolean
  title: ReactNode
  info: ReactNode
  children: ReactNode
  'data-testid'?: string
}

export const RewardCard = ({
  isLoading,
  title,
  info,
  children,
  'data-testid': dataTestId,
  className,
}: RewardCardProps) => {
  return (
    <Metric
      contentClassName="w-full"
      data-testid={dataTestId}
      title={
        <MetricTitle
          title={
            <Span variant="body-s" className="text-v3-bg-accent-0">
              {title}
            </Span>
          }
          info={<Paragraph className="text-[14px] font-normal text-left">{info}</Paragraph>}
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
        />
      }
      className={cn('w-auto', className)}
      containerClassName="gap-4 h-full"
    >
      {isLoading ? (
        <LoadingSpinner size={'medium'} />
      ) : (
        <div className={cn('flex flex-col justify-between gap-4 text-xl w-full', className)}>{children}</div>
      )}
    </Metric>
  )
}
