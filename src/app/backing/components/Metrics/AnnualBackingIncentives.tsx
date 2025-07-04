import { useGetBackerABI } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'

export const AnnualBackingIncentives = () => {
  const { address: backer } = useAccount()
  const { data: abiPct, isLoading, error } = useGetBackerABI(backer as Address)
  useHandleErrors({ error, title: 'Error loading backers abi' })

  if (isLoading) return <LoadingSpinner size="small" />

  return (
    <Metric
      title={
        <MetricTitle
          title={
            <Typography
              variant="tag"
              className="text-v3-bg-accent-0 text-base font-medium font-rootstock-sans leading-[150%]"
            >
              Annual Backing Incentives
            </Typography>
          }
          info={<KotoQuestionMarkIcon className="cursor-pointer" />}
        />
      }
    >
      <Header variant="h1">
        {abiPct.toFixed(0)}
        <span className="text-base">% (estimated)</span>
      </Header>
    </Metric>
  )
}
