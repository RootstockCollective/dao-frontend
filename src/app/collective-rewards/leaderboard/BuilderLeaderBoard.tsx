import { useCanManageAllocations } from '@/app/collective-rewards/allocations/hooks'
import { BuildersLeaderBoardContent } from '@/app/collective-rewards/leaderboard'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { Popover } from '@/components/Popover'
import { HeaderTitle, Paragraph, Typography } from '@/components/Typography'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponentSecondary } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { CRWhitepaperLink } from '../shared'

export const BuildersLeaderBoard = () => {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { data: isInDistributionPeriod } = useReadBackersManager({ functionName: 'onDistributionPeriod' })

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

const NoWalletConnectedPopover = (children: React.ReactNode) => (
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

const DistributionPeriodPopover = (children: React.ReactNode) => (
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
    return <>{NoWalletConnectedPopover(children)}</>
  }
  if (isInDistributionPeriod) {
    return <>{DistributionPeriodPopover(children)}</>
  }
  return <>{children}</>
}
