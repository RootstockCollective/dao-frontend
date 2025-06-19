import { Metric } from '@/components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { stRIF } from '@/lib/constants'

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
                <div className="pt-2 items-center">
                  <Typography
                    variant="h1"
                    caps
                    className="text-white overflow-hidden text-ellipsis line-clamp-1 font-kk-topo text-[32px] font-normal leading-[125%]"
                  >
                    {totalBacking}
                  </Typography>
                </div>
                <div className="flex py-2 pl-2 pr-0 items-center gap-1 rounded">
                  <TokenImage symbol={stRIF} size={24} />
                  <Typography variant="body-l" bold className="text-white text-right">
                    stRIF
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
