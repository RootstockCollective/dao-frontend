import { TopPageHeaderLeftSlotStrategy } from './TopPageHeaderLeftSlotStrategy'
/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * It will also render the left slot strategy component.
 * Which will render the left component based on the route.
 * The left component should be used for signposting, or anything else.
 * @constructor
 */
export function TopPageHeader() {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3">
      <div className="flex justify-start items-center">
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex justify-end flex-row gap-5 items-center">
        {/* Commented buttons to test reown  */}
        {/*<appkit-account-button />*/}
        {/*<appkit-network-button />*/}
      </div>
    </div>
  )
}
