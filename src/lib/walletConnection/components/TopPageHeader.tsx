import { UserConnectionManager } from '@/lib/walletConnection/connection/UserConnectionManager'
import { TopPageHeaderLeftSlotStrategy } from '@/lib/walletConnection/components/TopPageHeaderLeftSlotStrategy'
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
    <div className="flex my-4">
      <div className="flex-1">
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex flex-row gap-5 items-center">
        <BecomeABuilderButton address={address!} />
        <UserConnectionManager />
      </div>
    </div>
  )
}
