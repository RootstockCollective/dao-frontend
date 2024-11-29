import { BuildersLeaderBoardContent } from '@/app/collective-rewards/leaderboard'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useReadBackersManager } from '@/app/collective-rewards/shared'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { Popover } from '@/components/Popover'
import { HeaderTitle } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'

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
        <CollapsibleTrigger>
          <div className="flex items-center justify-between w-full">
            <HeaderTitle className="">Rewards leaderboard</HeaderTitle>

            <Popover
              content={
                <>
                  <p>Distribution in progress.</p>
                </>
              }
              trigger="hover"
              disabled={!isInDistributionPeriod}
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
