import { BecomeABuilderModal } from '@/components/Modal/BecomeABuilderModal'
import { Label } from '@/components/Typography'
import { useModal } from '@/shared/hooks/useModal'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { HeroItem, HeroItemProps } from './HeroItem'
import { HeroButton } from './HeroButton'
import { ConnectWorkflow } from '@/shared/walletConnection'
import { ConnectButtonComponentProps } from '@/shared/walletConnection/types'
import { useCollapseContext } from '@/app/user/HeroSection/HeroCollapseContext'

export const HeroSection = () => {
  const modal = useModal()
  const router = useRouter()
  const { isCollapsed, setIsCollapsed } = useCollapseContext()

  const StakeButton = ({ onClick }: ConnectButtonComponentProps) => (
    <HeroButton text="Stake" onClick={onClick} />
  )
  const heroItems: HeroItemProps[] = [
    {
      title: 'Build',
      description:
        'Become a builder on the Rootstock blockchain by leveraging its EVM compatibility and familiar development tools.',
      children: <HeroButton text="Become a Builder" onClick={modal.openModal} />,
    },
    {
      title: 'Earn',
      description:
        // prettier-ignore
        'Stake RIF and get voting rights and participation in the DAO\'s governance and decision-making process.',
      children: <ConnectWorkflow ConnectComponent={StakeButton} />,
    },
    {
      title: 'Participate',
      description:
        'Community proposals are discussed and voted on, determining actions such as grants or governance changes.',
      children: <HeroButton text="Proposals" onClick={() => router.push('/proposals')} />,
    },
  ]

  return (
    <div className="flex flex-col ml-[24px]">
      <Image
        src="images/hero-banner.svg"
        alt="Hero"
        width={0}
        height={0}
        style={{ width: '100%', height: 'auto' }}
      />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-row my-[16px] gap-[24px]"
          >
            {heroItems.map(heroItem => (
              <div key={heroItem.title} className="w-full">
                <HeroItem {...heroItem}>{heroItem.children}</HeroItem>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="flex flex-col justify-center items-center mt-[16px] cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <>
            <Label variant="semibold" className="text-primary cursor-pointer">
              Learn more
            </Label>
            <ChevronDown />
          </>
        ) : (
          <>
            <ChevronUp />
            <Label variant="semibold" className="text-primary cursor-pointer">
              Show less
            </Label>
          </>
        )}
      </div>
      {modal.isModalOpened && <BecomeABuilderModal onClose={modal.closeModal} />}
    </div>
  )
}
