import { Button } from '@/components/Button'
import { Metric } from '@/components/Metric/Metric'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { stRIF } from '@/lib/constants'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'

interface AvailableBackingMetricProps {
  availableForBacking: string
  availableBackingUSD: string
  onStakeClick?: () => void
  onDistributeClick?: () => void
}

const AvailableBackingUSD = ({ availableBackingUSD }: { availableBackingUSD: string }) => (
  <div className="flex items-start self-stretch">
    <Typography
      variant="tag-s"
      className="text-v3-bg-accent-0 font-rootstock-sans text-sm font-medium leading-[145%] self-stretch"
    >
      {availableBackingUSD}
    </Typography>
  </div>
)

const StakeButton = ({ onStakeClick }: { onStakeClick?: () => void }) => (
  <>
    <Button
      variant="primary"
      className="flex h-7 px-4 py-3 items-center gap-2 rounded bg-v3-primary hover:bg-v3-primary/90"
      onClick={onStakeClick}
    >
      <Typography variant="tag-s" className="text-v3-bg-accent-100">
        Stake some RIF
      </Typography>
    </Button>
  </>
)

const DistributeButton = ({ onDistributeClick }: { onDistributeClick?: () => void }) => (
  <div className="flex items-center gap-3">
    <Button
      variant="secondary"
      className="flex h-7 px-2 py-1 items-center gap-2 rounded border border-v3-bg-accent-40"
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
            <Typography className="self-stretch text-v3-bg-accent-100 font-rootstock-sans text-[14px] font-normal leading-[145%]">
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
)

export const AvailableBackingMetric = ({
  availableForBacking,
  availableBackingUSD,
  onStakeClick,
  onDistributeClick,
}: AvailableBackingMetricProps) => {
  const hasAvailableBacking = availableForBacking !== '0'
  const actions = hasAvailableBacking ? (
    <DistributeButton onDistributeClick={onDistributeClick} />
  ) : (
    <StakeButton onStakeClick={onStakeClick} />
  )

  return (
    <TokenAmountDisplay
      label="Available for backing"
      amount={availableForBacking}
      tokenSymbol={stRIF}
      amountInCurrency={availableBackingUSD}
      actions={actions}
    />
  )
}
