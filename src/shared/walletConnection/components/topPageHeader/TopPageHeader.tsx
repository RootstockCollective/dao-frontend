import { UserConnectionManager } from '../../connection'
import { TopPageHeaderLeftSlotStrategy } from './TopPageHeaderLeftSlotStrategy'
import { BecomeABuilderButton } from '@/app/collective-rewards/user'
import { useAccount } from 'wagmi'
import { useCollapseContext } from '@/app/user/HeroSection/HeroCollapseContext'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'
import { collectiveRewards, home } from '@/shared/constants'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
/**
 * This component will render first for all pages. It should contain the user connection workflow.
 * It will also render the left slot strategy component.
 * Which will render the left component based on the route.
 * The left component should be used for signposting, or anything else.
 * @constructor
 */
export function TopPageHeader() {
  const { address, isConnected } = useAccount()
  const { isCollapsed } = useCollapseContext()
  const pathname = usePathname()
  const isMyCollective = pathname === home
  const isCollectiveRewards = pathname === collectiveRewards
  const { isBoosted } = useNFTBoosterContext()
  const forceRender = isCollectiveRewards || (isMyCollective && isBoosted)

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 mb-4">
      <div>
        <TopPageHeaderLeftSlotStrategy />
      </div>
      <div className="flex justify-end flex-row gap-5 items-center">
        <SelfContainedNFTBoosterCard forceRender={forceRender} />
        <AnimatePresence mode="sync">
          {(isCollapsed || !isMyCollective || (isMyCollective && isConnected)) && (
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
        {/* Commented buttons to test reown  */}
        {/*<appkit-account-button />*/}
        {/*<appkit-network-button />*/}
        <UserConnectionManager />
      </div>
    </div>
  )
}
