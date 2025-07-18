import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, type Transition, type Variants } from 'motion/react'
import { UsefulLinks } from './UsefulLinks'
import styles from './styles.module.css'
import { cn } from '@/lib/utils'
import { NavIcon } from '../icons/NavIcon'
import { menuData } from './menuData'
import { RootstockLogoIcon } from '@/components/Icons'
import { useLayoutContext } from '../LayoutProvider'
import { Tooltip } from '@/components/Tooltip'

const transition: Transition = { duration: 0.3, ease: 'circOut' }

export const SIDEBAR_OPENED_WIDTH = 239
export const SIDEBAR_CLOSED_WIDTH = 79

export const SidebarDesktop = () => {
  const { isSidebarOpen } = useLayoutContext()

  // Animation variants for the sidebar UI states
  const variants = useMemo<Variants>(
    () => ({
      sidebar: {
        width: isSidebarOpen ? SIDEBAR_OPENED_WIDTH : SIDEBAR_CLOSED_WIDTH,
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
      <div
        className={cn(
          'h-[calc(100vh-var(--header-height))]',
          'flex flex-col justify-between whitespace-nowrap',
        )}
      >
        <div>
          {/* Logo link */}
          <Link href="/" className="m-6 block w-fit">
            <RootstockLogoIcon />
          </Link>
          {/* Menu */}
          <ul className="px-3">
            {menuData.map(data => (
              <MenuItem variants={variants} key={data.href} {...data} />
            ))}
          </ul>
        </div>
        {/* Useful links */}
        <motion.div
          variants={variants}
          initial="text"
          animate="text"
          transition={{ duration: transition.duration, ease: 'easeOut' }}
          /* Hide transparent links */
          className={cn('fixed bottom-8', { 'pointer-events-none': !isSidebarOpen })}
        >
          <UsefulLinks className="ml-6" />
        </motion.div>
      </div>
    </motion.aside>
  )
}

const MenuItem = ({
  href,
  text,
  buttonProps,
  variants,
}: (typeof menuData)[number] & { variants: Variants }) => {
  const { isSidebarOpen } = useLayoutContext()
  const isActive = usePathname().split('/').at(1) === href
  return (
    <li className={cn('relative pl-3', { 'bg-v-charcoal': isSidebarOpen && isActive })}>
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
}
