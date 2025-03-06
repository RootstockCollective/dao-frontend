import { UserConnectionManager } from '@/components/UserConnectionWorkflow/connection/UserConnectionManager'
import { TopPageHeaderLeftSlotStrategy } from '@/components/UserConnectionWorkflow/TopPageHeaderLeftSlotStrategy'
import { BecomeABuilderButton } from '@/app/collective-rewards/user'
import { useAccount } from 'wagmi'

/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * It will also render the left slot strategy component.
 * Which will render the left component based on the route.
 * The left component should be used for signposting, or anything else.
 * @constructor
 */
export function TopPageHeader() {
  const { address } = useAccount()
  return (
    <div className="flex">
      <div className="flex-1">
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex flex-row gap-x-[20px] items-center">
        <BecomeABuilderButton address={address!} />
        <UserConnectionManager />
      </div>
    </div>
  )
}
