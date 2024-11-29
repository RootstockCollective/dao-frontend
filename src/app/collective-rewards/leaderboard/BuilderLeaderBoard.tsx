import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'
import { BuildersLeaderBoardContent } from '@/app/collective-rewards/leaderboard'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useReadBackersManager } from '@/app/collective-rewards/shared'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { Popover } from '@/components/Popover'
import { HeaderTitle, Paragraph, Typography } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { CRWhitepaperLink } from '../shared'

export const BuildersLeaderBoard = () => {
  const router = useRouter()
  const { data: isInDistributionPeriod } = useReadBackersManager('onDistributionPeriod')

  const onManageAllocations = () => {
    router.push('/collective-rewards/allocations')
  }

  const canManageAllocations = useCanManageAllocations()

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="self-start pt-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center items-start gap-2 flex-1">
              <HeaderTitle className="">Rewards leaderboard</HeaderTitle>
              <Paragraph className="text-[14px] text-white font-rootstock-sans">
                Select one or more Builders you want to back. You retain full ownership and access to your
                stRIF while earning a portion of their rewards. For more information check the{' '}
                <CRWhitepaperLink />.
              </Paragraph>
            </div>

            <Popover
              content={
                <div className="flex flex-col">
                  <Typography
                    tagVariant="h2"
                    fontFamily="kk-topo"
                    className="self-end text-[20.44px] text-primary font-normal uppercase"
                  >
                    Rewards distribution is in progress.
                  </Typography>
                  <Typography tagVariant="p" fontFamily="rootstock-sans" className="self-end">
                    Manage Allocation will be available shortly, please check back soon
                  </Typography>
                </div>
              }
              trigger="hover"
              disabled={!isInDistributionPeriod}
              contentContainerClassName="top-full -left-[87%]"
            >
              <Button
                variant="primary"
                onClick={onManageAllocations}
                disabled={!!isInDistributionPeriod || !canManageAllocations}
              >
                Manage Allocations
              </Button>
            </Popover>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CycleContextProvider>
            <BuildersLeaderBoardContent />
          </CycleContextProvider>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
