import { Button } from '@/components/Button'
import { Metric } from '@/components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { stRIF } from '@/lib/constants'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'

interface AvailableBackingMetricProps {
  availableForBacking: number
  availableBackingUSD: number
  onStakeClick?: () => void
  onDistributeClick?: () => void
}

export const AvailableBackingMetric = ({
  availableForBacking,
  availableBackingUSD,
  onStakeClick,
  onDistributeClick,
}: AvailableBackingMetricProps) => {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <Metric
        title={
          <Typography
            variant="tag"
            className="text-[#ACA39D] text-base font-medium font-rootstock-sans leading-[150%]"
          >
            Available for backing
          </Typography>
        }
        className="flex-1"
        content={
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="flex h-10 items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="pt-2 items-center [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                  <Typography
                    variant="h1"
                    caps
                    className="text-white overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box] font-kk-topo text-[32px] font-normal leading-[125%]"
                  >
                    {availableForBacking}
                  </Typography>
                </div>
                <div className="flex py-2 pl-2 pr-0 items-center gap-1 rounded">
                  <TokenImage symbol={stRIF} size={24} />
                  <Typography variant="body-l" bold className="text-white text-right">
                    stRIF
                  </Typography>
                </div>
              </div>
              <div className="flex items-center">
                {availableForBacking === 0 ? (
                  <Button
                    variant="primary"
                    className="flex h-7 px-4 py-3 items-center gap-2 rounded bg-[#F47A2A] hover:bg-[#E6691B]"
                    onClick={onStakeClick}
                  >
                    <Typography variant="tag-s" className="text-[#171412]">
                      Stake some RIF
                    </Typography>
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      className="flex h-7 px-2 py-1 items-center gap-2 rounded border border-[#66605C]"
                      onClick={onDistributeClick}
                    >
                      <Typography
                        variant="tag-s"
                        className="text-white font-rootstock-sans text-sm font-normal leading-[145%]"
                      >
                        Distribute equally
                      </Typography>
                    </Button>
                    <div className="flex w-4 py-[6px] flex-col justify-center items-center self-stretch aspect-square">
                      <KotoQuestionMarkIcon />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {availableForBacking > 0 && (
              <div className="flex items-start self-stretch">
                <Typography
                  variant="tag-s"
                  className="text-[#ACA39D] font-rootstock-sans text-sm font-medium leading-[145%] self-stretch"
                >
                  {availableBackingUSD} USD
                </Typography>
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}
