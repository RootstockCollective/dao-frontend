import { Metric } from '@/components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { StRIFToken } from '@/app/backing/components/StRIFToken/StRIFToken'

interface TotalBackingMetricProps {
  totalBacking: string
}

export const TotalBackingMetric = ({ totalBacking }: TotalBackingMetricProps) => {
  return (
    <div className="flex-1">
      <Metric
        title={
          <Typography
            variant="tag"
            className="text-v3-bg-accent-0 text-base font-medium font-rootstock-sans leading-[150%]"
          >
            Total backing
          </Typography>
        }
        className="flex-1"
        content={
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="flex h-10 items-center gap-6">
              <div className="flex items-center gap-2">
                <Typography
                  variant="h1"
                  caps
                  className="text-white overflow-hidden text-ellipsis line-clamp-1 font-kk-topo text-[32px] font-normal leading-[125%]"
                >
                  {totalBacking}
                </Typography>
                <StRIFToken className="py-2 pl-2 pr-0 rounded" />
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
