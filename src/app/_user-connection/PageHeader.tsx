import { UserConnectionManager } from '@/app/_user-connection/connection/UserConnectionManager'
import { PageHeaderLeftSlotStrategy } from '@/app/_user-connection/PageHeaderLeftSlotStrategy'

/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * @constructor
 */
export function PageHeader() {
  return (
    <div className="flex">
      <div className="flex-1">
        <PageHeaderLeftSlotStrategy />
      </div>
      <div>
        <UserConnectionManager />
      </div>
    </div>
  )
}
