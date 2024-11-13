import { MetricsCard, MetricsCardRow, MetricsCardTitle } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { DateTime } from 'luxon'
import { FC, HTMLAttributes, ReactNode, useEffect } from 'react'
import { weiToPercentage } from '../utils'
import { useBuilderSettingsContext } from './context'

const getDateTimeRemaining = (cooldownEndTime: DateTime | undefined): string | undefined => {
  if (!cooldownEndTime) {
    return
  }

  const now = DateTime.now()
  const remaining = cooldownEndTime.diff(now, ['days', 'hours', 'minutes'])
  if (remaining.as('minutes') < 0) {
    return
  }

  return `${remaining.days}D ${remaining.hours}H ${remaining.minutes.toFixed(0)}M`
}

export const RewardsSettingsCard: FC<{
  children: ReactNode
  className?: HTMLAttributes<HTMLDivElement>['className']
  title: string
  dataTestId: string
}> = ({ children, title, className, dataTestId }) => {
  return (
    <MetricsCard
      className={cn('rounded-none max-w-min min-w-[172px]', className ?? {})}
      dataTestId={dataTestId}
    >
      <MetricsCardTitle title={title} data-testid={dataTestId} />
      <MetricsCardRow>{children}</MetricsCardRow>
    </MetricsCard>
  )
}

export const BuilderRewardsSettingsMetrics: FC = () => {
  const {
    current: { data, isLoading },
  } = useBuilderSettingsContext()

  const timeRemaining: string | undefined = getDateTimeRemaining(data?.cooldownEndTime)

  return (
    <div className="flex flex-row gap-2.5 self-stretch items-start content-start flex-nowrap">
      <RewardsSettingsCard title="Current %" dataTestId="CurrentBackerReward">
        {withSpinner(Typography)({
          tagVariant: 'h2',
          className: 'text-2xl leading-[120%] uppercase text-primary font-normal',
          isLoading: isLoading,
          children: `${weiToPercentage(data?.previous ?? 0n)}%`,
        })}
      </RewardsSettingsCard>

      {timeRemaining && (
        <>
          <RewardsSettingsCard title="Next %" dataTestId="NextBackerReward">
            <Typography
              tagVariant="h2"
              className="text-2xl leading-[120%] uppercase text-primary font-normal"
            >
              {weiToPercentage(data?.next ?? 0n)}%
            </Typography>
          </RewardsSettingsCard>
          <RewardsSettingsCard
            className="min-w-[242px]"
            title="Takes Effect In"
            dataTestId="BackerRewardCooldown"
          >
            <Typography
              tagVariant="h2"
              className="text-2xl leading-[120%] uppercase text-primary font-normal"
            >
              {getDateTimeRemaining(data?.cooldownEndTime) ?? '-'}
            </Typography>
          </RewardsSettingsCard>
        </>
      )}
    </div>
  )
}
