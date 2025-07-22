import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Paragraph } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
import { ReactNode } from 'react'

export const RewardCard = ({
  isLoading,
  title,
  info,
  children,
  'data-testid': dataTestId,
}: {
  isLoading: boolean
  title: ReactNode
  info: ReactNode
  children: ReactNode
  'data-testid'?: string
}) => {
  return (
    <Metric
      data-testid={dataTestId}
      title={
        <MetricTitle
          title={
            <Typography variant="body" className="text-v3-bg-accent-0 text-sm">
              {title}
            </Typography>
          }
          info={<Paragraph className="text-[14px] font-normal text-left">{info}</Paragraph>}
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
        />
      }
      className="w-auto"
      containerClassName="gap-4 h-full"
    >
      {isLoading ? (
        <LoadingSpinner size={'medium'} />
      ) : (
        <div className="flex flex-col gap-4 text-xl">{children}</div>
      )}
    </Metric>
  )
}
