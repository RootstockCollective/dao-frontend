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
import { useAccount } from 'wagmi'
import { ConnectWorkflow } from '@/shared/walletConnection'
import { ConnectButtonComponentSecondary } from '@/shared/walletConnection/components/ConnectButtonComponent'

export const BuildersLeaderBoard = () => {
  const router = useRouter()
  const { data: isInDistributionPeriod } = useReadBackersManager('onDistributionPeriod')
  const { isConnected } = useAccount()

  const onManageAllocations = () => {
    router.push('/collective-rewards/allocations')
  }

  const canManageAllocations = useCanManageAllocations()

  const isActionEnabled = isConnected && !isInDistributionPeriod && canManageAllocations

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

            <PopoverWrapper isInDistributionPeriod={!!isInDistributionPeriod} isConnected={isConnected}>
              <Button
                variant={isActionEnabled ? 'primary' : 'outlined'}
                onClick={onManageAllocations}
                disabled={!isActionEnabled}
              >
                Manage Allocations
              </Button>
            </PopoverWrapper>
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

const noWalletConnectedPopover = (children: React.ReactNode) => (
  <Popover
    content={
      <>
        <Paragraph variant="normal" className="text-sm pb-3">
          Manage how your stRIF are allocated to builders. Support projects and earn rewards at the end of
          each cycle.
        </Paragraph>
        <ConnectWorkflow ConnectComponent={ConnectButtonComponentSecondary} />
      </>
    }
    trigger="hover"
    size="medium"
    position="top-expand-left"
    contentSubContainerClassName="p-3"
  >
    {children}
  </Popover>
)

const distributionPeriodPopover = (children: React.ReactNode) => (
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
    contentContainerClassName="top-full -left-[87%]"
  >
    {children}
  </Popover>
)

const PopoverWrapper: React.FC<{
  isInDistributionPeriod: boolean
  isConnected: boolean
  children: React.ReactNode
}> = ({ isInDistributionPeriod, isConnected, children }) => {
  if (!isConnected) {
    return <>{noWalletConnectedPopover(children)}</>
  }
  if (isInDistributionPeriod) {
    return <>{distributionPeriodPopover(children)}</>
  }
  return <>{children}</>
}
