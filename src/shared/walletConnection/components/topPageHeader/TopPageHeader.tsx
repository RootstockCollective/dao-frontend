import { UserConnectionManager } from '../../connection'
import { TopPageHeaderLeftSlotStrategy } from './TopPageHeaderLeftSlotStrategy'
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
    <div className="grid grid-cols-[1fr_auto] gap-x-3 mb-4">
      <div>
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex justify-end flex-row gap-5 items-center">
        <BecomeABuilderButton address={address!} />
        <UserConnectionManager />
      </div>
    </div>
  )
}
