import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, type Transition } from 'motion/react'
import { UsefulLinks } from './UsefulLinks'
import styles from './styles.module.css'
import { cn } from '@/lib/utils'
import { NavIcon } from './NavIcon'
import { sidebarData } from './sidebarData'
import { RootstockLogoIcon } from '../Icons'
import { useLayoutContext } from '@/app/providers/LayoutProvider'
import { Tooltip } from '../Tooltip/'

const sideBarWidth = 239
const closedSideWidth = 79
const transition: Transition = { duration: 0.3, ease: 'circOut' }

export const SidebarDesktop = () => {
  const activeButton = usePathname()?.substring(1)
  const { isSidebarOpen } = useLayoutContext()

  // Animation variants for the sidebar UI states
  const variants = useMemo(
    () => ({
      sidebar: {
        width: isSidebarOpen ? sideBarWidth : closedSideWidth,
      },
      icon: { scale: isSidebarOpen ? 1 : 1.6, x: isSidebarOpen ? 0 : 5 },
      text: { opacity: +isSidebarOpen },
    }),
    [isSidebarOpen],
  )
  return (
    <motion.aside
      variants={variants}
      initial="sidebar"
      animate="sidebar"
      whileInView={{ opacity: 1 }}
      transition={transition}
      className={cn('overflow-hidden shrink-0 border-r border-dark-gray')}
    >
      <div className="h-[calc(100vh-40px)] flex flex-col justify-between whitespace-nowrap">
        <div>
          <Link href="/" className="m-6 block w-fit">
            <RootstockLogoIcon />
          </Link>
          <ul className="px-3">
            {sidebarData.map(({ text, href, buttonProps }) => {
              const isActive = activeButton === href
              return (
                <li key={href} className={cn('relative pl-3', isSidebarOpen && isActive && 'bg-v-charcoal')}>
                  <Link href={`/${href}`} data-testid={buttonProps.id}>
                    <div
                      className={cn(
                        'h-10 flex flex-row flex-nowrap gap-2 items-center group',
                        isActive && styles['nav-active'],
                      )}
                    >
                      <motion.div variants={variants} initial="icon" animate="icon" transition={transition}>
                        <Tooltip text={text} disabled={isSidebarOpen}>
                          <NavIcon />
                        </Tooltip>
                      </motion.div>

                      <motion.span
                        variants={variants}
                        initial="text"
                        animate="text"
                        className={cn('text-sm font-light font-rootstock-sans', {
                          // hide transparent text when sidebar is closed
                          'pointer-events-none': !isSidebarOpen,
                        })}
                      >
                        {text}
                      </motion.span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <motion.div
          variants={variants}
          initial="text"
          animate="text"
          transition={{ duration: transition.duration, ease: 'easeOut' }}
          /* Hide transparent links */
          className={cn({ 'pointer-events-none': !isSidebarOpen })}
        >
          <UsefulLinks className="ml-6" />
        </motion.div>
      </div>
    </motion.aside>
  )
}
