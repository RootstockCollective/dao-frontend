import { BackersPercentage } from '@/app/builders/components/Table/Cell/BackersPercentageCell/BackersPercentageCell'
import { BackingCell } from '@/app/builders/components/Table/Cell/BackingCell/BackingCell'
import { BuilderName } from '@/app/builders/components/Table/Cell/BuilderNameCell/BuilderName'
import { RewardsCell } from '@/app/builders/components/Table/Cell/RewardsCell/RewardsCell'
import { Button } from '@/components/Button'
import { Collapsible } from '@/components/Collapsible'
import { Divider } from '@/components/Divider'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { CogIcon } from '@/components/Icons/v3design/CogIcon'
import { Span } from '@/components/Typography'
import { Row } from '@/shared/context/TableContext/types'
import { useRouter } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { BackerRewardsCellDataMap, ColumnId } from './BackerRewardsTable.config'

const RewardDetailsMetric = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-1 flex-col align-items-start gap-0.5">{children}</div>
}

const RewardDetailsItem = ({ row }: { row: Row<ColumnId, Row['id'], BackerRewardsCellDataMap> }) => {
  const router = useRouter()
  return (
    <>
      <div className="flex flex-col align-start gap-4 px-0 py-5">
        <Collapsible.Root className="gap-4" defaultOpen={false}>
          <div className="flex justify-between align-start align-self-stretch">
            <div className="flex align-items-center gap-3 place-items-center">
              <Jdenticon className="rounded-full bg-white w-10" value={row.data.builder.builder.address} />
              <BuilderName
                builder={row.data.builder.builder}
                isHighlighted={false}
                builderPageLink={`/proposals/${row.data.builder.builder.proposal.id}`}
              />
            </div>

            <Collapsible.Toggle className="w-auto" />
          </div>
          <div className="flex align-start align-self-stretch gap-6">
            <RewardDetailsMetric>
              <Span variant="h5" className="text-v3-text-40">
                Unclaimed
              </Span>
              <RewardsCell
                className="justify-start"
                usdValue={row.data.unclaimed.usdValue}
                rbtcValue={row.data.unclaimed.rbtcValue}
                rifValue={row.data.unclaimed.rifValue}
              />
            </RewardDetailsMetric>
            <RewardDetailsMetric>
              <Span variant="h5" className="text-v3-text-40">
                Estimated this cycle
              </Span>
              <RewardsCell
                usdValue={row.data.estimated.usdValue}
                rbtcValue={row.data.estimated.rbtcValue}
                rifValue={row.data.estimated.rifValue}
              />
            </RewardDetailsMetric>
          </div>
          <Collapsible.Content className="flex flex-col gap-4">
            <div className="flex align-start align-self-stretch gap-6">
              <RewardDetailsMetric>
                <Span variant="h5" className="text-v3-text-40">
                  Backer rewards %
                </Span>
                <BackersPercentage className="self-start" percentage={row.data.backer_rewards.percentage} />
              </RewardDetailsMetric>
              <RewardDetailsMetric>
                <Span variant="h5" className="text-v3-text-40">
                  Earned this cycle
                </Span>
                {/* FIXME: to be decided */}
                NOT IMPLEMENTED YET
              </RewardDetailsMetric>
            </div>
            <div className="flex align-start align-self-stretch gap-6">
              <RewardDetailsMetric>
                <Span variant="h5" className="text-v3-text-40">
                  Total - lifetime
                </Span>
                <RewardsCell
                  className="justify-start"
                  usdValue={row.data.total.usdValue}
                  rbtcValue={row.data.total.rbtcValue}
                  rifValue={row.data.total.rifValue}
                />
              </RewardDetailsMetric>
              <RewardDetailsMetric>
                <Span variant="h5" className="text-v3-text-40">
                  Backing
                </Span>
                <BackingCell {...row.data.backing} />
              </RewardDetailsMetric>
            </div>
            <Button
              variant="transparent"
              className="flex w-full items-center gap-1"
              onClick={() => router.push(`/backing?builders=${row.data.builder.builder.address}`)}
            >
              <CogIcon size={20} /> <Span className="text-[0.875rem] font-normal">Adjust backing</Span>
            </Button>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
      <Divider className="m-0" />
    </>
  )
}

export const MobileRewardsDetails = ({
  rows,
}: {
  rows: Row<ColumnId, Row['id'], BackerRewardsCellDataMap>[]
}) => {
  return (
    <>
      <Suspense fallback={<div>Loading table data...</div>}></Suspense>
      <div className="flex flex-col align-start w-full">
        {rows.map(row => (
          <RewardDetailsItem key={row.id} row={row} />
        ))}
      </div>
    </>
  )
}
