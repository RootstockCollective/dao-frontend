import { Button } from '@/components/Button'
import { Metric } from '@/components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
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
    <div className="flex flex-col items-start gap-2 self-stretch flex-1">
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
                <div className="pt-2 items-center">
                  <Typography
                    variant="h1"
                    caps
                    className="text-white overflow-hidden text-ellipsis line-clamp-1 font-kk-topo text-[32px] font-normal leading-[125%]"
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
                      <Tooltip
                        text={
                          <div className="flex w-[269px] p-6 flex-col items-start gap-2">
                            <Typography className="self-stretch text-[#171412] font-rootstock-sans text-[14px] font-normal leading-[145%]">
                              You&apos;ll be distributing equally to each of the Builders below
                            </Typography>
                          </div>
                        }
                        side="top"
                        align="center"
                        alignOffset={-60}
                        sideOffset={10}
                        className="bg-white rounded-[4px] shadow-lg"
                      >
                        <KotoQuestionMarkIcon />
                      </Tooltip>
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
                  {availableBackingUSD.toFixed(2)} USD
                </Typography>
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}
