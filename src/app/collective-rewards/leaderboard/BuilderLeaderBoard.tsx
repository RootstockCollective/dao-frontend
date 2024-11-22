import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/user'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { HeaderTitle } from '@/components/Typography'
import { BuildersLeaderBoardContent } from '@/app/collective-rewards/leaderboard'

export const BuildersLeaderBoard = () => {
  const onManageAllocations = () => {
    // TODO: fill the allocation context if necessary and change the route
    console.log('Manage allocations')
  }

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <div className="flex items-center justify-between w-full">
            <HeaderTitle className="">Rewards leaderboard</HeaderTitle>
            <Button variant="primary" onClick={onManageAllocations}>
              Manage Allocations
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CycleContextProvider>
            <BuilderContextProviderWithPrices>
              <BuildersLeaderBoardContent />
            </BuilderContextProviderWithPrices>
          </CycleContextProvider>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
