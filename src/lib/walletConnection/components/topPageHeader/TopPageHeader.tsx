import { UserConnectionManager } from '@/lib/walletConnection/connection/UserConnectionManager'
import { TopPageHeaderLeftSlotStrategy } from '@/lib/walletConnection/components/topPageHeader/TopPageHeaderLeftSlotStrategy'
import { BecomeABuilderButton } from '@/app/collective-rewards/user'
import { useAccount } from 'wagmi'

/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * It will also render the left slot strategy component.
 * Which will render the left component based on the route.
 * The left component should be used for signposting, or anything else.
 * Decided to use style because tailwind css custom values is not working for grid templates.
 * @constructor
 */
export function TopPageHeader() {
  const { address } = useAccount()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        columnGap: '10px',
        marginBottom: '16px',
      }}
    >
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
