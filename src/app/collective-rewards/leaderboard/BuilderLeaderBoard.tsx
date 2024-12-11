import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { HeaderTitle, Paragraph } from '@/components/Typography'
import { BuildersLeaderBoardContent } from '@/app/collective-rewards/leaderboard'
import { useRouter } from 'next/navigation'
import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'
import { CRWhitepaperLink } from '../shared'

export const BuildersLeaderBoard = () => {
  const router = useRouter()
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
            <Button variant="primary" onClick={onManageAllocations} disabled={!canManageAllocations}>
              Manage Allocations
            </Button>
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
