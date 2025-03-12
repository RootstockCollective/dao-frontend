import { UserConnectionManager } from '../../connection'
import { TopPageHeaderLeftSlotStrategy } from './TopPageHeaderLeftSlotStrategy'
import { BecomeABuilderButton } from '@/app/collective-rewards/user'
import { useAccount } from 'wagmi'
import { useCollapseContext } from '@/app/user/HeroSection/HeroCollapseContext'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'

/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * It will also render the left slot strategy component.
 * Which will render the left component based on the route.
 * The left component should be used for signposting, or anything else.
 * @constructor
 */
export function TopPageHeader() {
  const { address } = useAccount()
  const { isCollapsed } = useCollapseContext()
  const pathname = usePathname()
  const isNotMyCollective = pathname !== '/'

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 mb-4">
      <div>
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex justify-end flex-row gap-5 items-center">
        {/* TODO: we may need to change it if we decide to show this component on certain pages only */}
        <SelfContainedNFTBoosterCard forceRender={true} />
        <AnimatePresence mode="sync">
          {(isCollapsed || isNotMyCollective) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BecomeABuilderButton address={address!} />
            </motion.div>
          )}
        </AnimatePresence>
        <UserConnectionManager />
      </div>
    </div>
  )
}
