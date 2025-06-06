import { useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutContext } from '../LayoutProvider'
import { UsefulLinks } from './UsefulLinks'
import { NavIcon } from '../icons/NavIcon'
import { menuData } from './menuData'
import { cn } from '@/lib/utils/utils'
import styles from './styles.module.css'

export function SidebarMobile() {
  const { isSidebarOpen, closeSidebar } = useLayoutContext()
  const variants = useMemo<Variants>(
    () => ({
      drawer: {
        x: isSidebarOpen ? 0 : '-100%',
      },
    }),
    [isSidebarOpen],
  )
  return (
    <motion.div
      variants={variants}
      initial="drawer"
      animate="drawer"
      className={cn(
        'h-[calc(100dvh-var(--header-height))] w-full pl-10 py-12',
        'absolute inset-0 z-40 bg-l-black',
      )}
      transition={{ duration: 0.3, ease: 'circOut' }}
      onClick={closeSidebar}
    >
      <div className="h-full flex flex-col justify-between gap-4">
        <ul className="w-fit">
          {menuData.map(data => (
            <MenuItem key={data.href} {...data} />
          ))}
        </ul>
        <UsefulLinks className="ml-4" />
      </div>
    </motion.div>
  )
}

const MenuItem = ({ text, href }: (typeof menuData)[number]) => {
  const isActive = usePathname()?.substring(1) === href
  const { closeSidebar } = useLayoutContext()
  return (
    <li className={cn('relative pl-3 pr-16', { 'bg-v-charcoal': isActive })}>
      <Link href={`/${href}`} onClick={closeSidebar}>
        <div className={cn('h-10 flex flex-nowrap gap-2 items-center', { [styles['nav-active']]: isActive })}>
          <NavIcon />
          <p className="text-sm font-light font-rootstock-sans">{text}</p>
        </div>
      </Link>
    </li>
  )
}
