import { Fragment, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLayoutContext } from '../LayoutProvider'
import { UsefulLinks } from './UsefulLinks'
import { NavIcon } from '../icons/NavIcon'
import { MenuData, menuData, menuDataNotConnected } from './menuData'
import { cn } from '@/lib/utils'
import styles from './styles.module.css'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import { Span } from '@/components/Typography'

export function SidebarMobile() {
  const { isSidebarOpen, closeSidebar } = useLayoutContext()
  const { isConnected } = useAccount()
  const variants = useMemo<Variants>(
    () => ({
      drawer: {
        x: isSidebarOpen ? 0 : '-100%',
      },
    }),
    [isSidebarOpen],
  )

  const menuDataToUse = isConnected ? menuData : menuDataNotConnected
  return (
    <motion.div
      variants={variants}
      initial="drawer"
      animate="drawer"
      className={cn('h-screen w-full pl-10 py-12', 'fixed inset-0 z-40 bg-l-black')}
      transition={{ duration: 0.3, ease: 'circOut' }}
      onClick={closeSidebar}
    >
      <div className="h-full flex flex-col justify-start overflow-y-auto">
        <ul className="w-fit mt-12">
          {menuDataToUse.map(data => (
            <Fragment key={data.buttonProps.id}>
              {'type' in data && data.type === 'category' ? (
                <div className="px-3 py-2">
                  <Span variant="tag" className="text-bg-0">
                    {data.text}
                  </Span>
                </div>
              ) : (
                <MenuItem key={data.buttonProps.id} {...data} />
              )}
            </Fragment>
          ))}
        </ul>
        <UsefulLinks className="ml-4 mt-12" />
      </div>
    </motion.div>
  )
}

const MenuItem = ({ text, href, iconUrl, buttonProps }: MenuData) => {
  const isActive = usePathname()?.substring(1) === href
  const { closeSidebar } = useLayoutContext()
  const router = useRouter()

  const handleClick = () => {
    // Close sidebar immediately to prevent interference with navigation
    closeSidebar()
    // Use setTimeout to ensure sidebar closes before navigation
    setTimeout(() => {
      router.push(`/${href}`)
    }, 100)
  }

  return (
    <li className={cn('relative pl-3 pr-16', { 'bg-v-charcoal': isActive })}>
      <Link href={`/${href}`} onClick={handleClick} data-testid={buttonProps.id}>
        <div className={cn('h-10 flex flex-nowrap gap-2 items-center', { [styles['nav-active']]: isActive })}>
          {iconUrl ? <Image src={iconUrl} width={20} height={20} alt="Icon" /> : <NavIcon />}
          <p className="text-sm font-light font-rootstock-sans">{text}</p>
        </div>
      </Link>
    </li>
  )
}
