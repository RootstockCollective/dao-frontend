'use client'

import {
  BuilderHeaderCell,
  CombinedActionsHeaderCell,
  HeaderCell,
  HeaderSubtitle,
  HeaderTitle,
  TableColumnDropdown,
} from '@/app/builders/components/Table'
import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Button } from '@/components/ButtonNew'
import { CloseIconKoto } from '@/components/Icons'
import { TableHeaderCell } from '@/components/TableNew'
import { Paragraph } from '@/components/TypographyNew'
import { useTableActionsContext } from '@/shared/context'
import { Suspense } from 'react'
import { COLUMN_TRANSFORMS, LABELS } from './BackerRewardsTable.config'

export type BackerRewardsHeaderRowProps = {
  actions: Action[]
}
export const BackerRewardsHeaderRow = ({ actions }: BackerRewardsHeaderRowProps) => {
  const dispatch = useTableActionsContext()
  const handleCancelActions = () => {
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
  }
  const actionCount = actions.length

  return (
    <Suspense fallback={<div>Loading table headers...</div>}>
      <tr className="flex border-b-1 border-b-v3-text-60 select-none gap-4 pb-4">
        <BuilderHeaderCell key="builder" columnId="builder" />
        {actionCount <= 1 && (
          <>
            <HeaderCell key="backer_rewards" columnId="backer_rewards" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Backer Rewards</HeaderTitle>
              <HeaderSubtitle>%</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="unclaimed"
              columnId="unclaimed"
              columnTransforms={COLUMN_TRANSFORMS}
              tooltip={{
                text: 'Your rewards from each Builder available to claim',
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Unclaimed</HeaderTitle>
              {/* Empty subtitle to align the text vertically */}
              <HeaderSubtitle></HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="estimated"
              columnId="estimated"
              columnTransforms={COLUMN_TRANSFORMS}
              tooltip={{
                text: (
                  <div className="flex flex-col gap-2 text-wrap max-w-[35rem]">
                    <Paragraph>
                      An estimate of the remainder of this Cycle&apos;s rewards from each Builder that will
                      become fully claimable by the end of the current Cycle. These rewards gradually
                      transition into your &apos;Claimable Rewards&apos; as the cycle progresses.
                    </Paragraph>
                    <Paragraph className="mt-2 mb-2">
                      To check the cycle`s completion, go to Collective Rewards → Current Cycle.
                    </Paragraph>
                    <Paragraph>
                      The displayed information is dynamic and may vary based on total rewards and user
                      activity. This data is for informational purposes only.
                    </Paragraph>
                  </div>
                ),
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Estimated</HeaderTitle>
              <HeaderSubtitle>this cycle</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell
              key="total"
              columnId="total"
              columnTransforms={COLUMN_TRANSFORMS}
              tooltip={{
                text: 'The total of your received and claimable rewards for each Builder',
                side: 'top',
                sideOffset: 10,
              }}
            >
              <HeaderTitle>Total</HeaderTitle>
              <HeaderSubtitle>lifetime</HeaderSubtitle>
            </HeaderCell>
            <HeaderCell key="backing" columnId="backing" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Backing</HeaderTitle>
              <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>
              {/* TODO: temporary fix to align the text to the top */}
            </HeaderCell>
            <HeaderCell columnId="actions" columnTransforms={COLUMN_TRANSFORMS}>
              <HeaderTitle>Actions</HeaderTitle>
              <HeaderSubtitle className="h-full text-v3-bg-accent-80">balls</HeaderSubtitle>
              {/* TODO: temporary fix to align the text to the top */}
            </HeaderCell>
            <th>
              <TableColumnDropdown className="self-start" labels={LABELS} />
            </th>
          </>
        )}
        {actionCount > 1 && (
          <>
            <CombinedActionsHeaderCell actions={actions} />
            <TableHeaderCell contentClassName="items-start">
              <Button
                variant="secondary"
                className="p-0 border-none bg-inherit"
                onClick={handleCancelActions}
              >
                <CloseIconKoto className="w-5 h-5 text-v3-text-100" />
              </Button>
            </TableHeaderCell>
          </>
        )}
      </tr>
    </Suspense>
  )
}
