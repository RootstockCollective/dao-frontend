import { useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import { useLayoutContext } from '../LayoutProvider'
import { menuData } from './menuData'

const width = 375

export function SidebarMobile() {
  const { isSidebarOpen } = useLayoutContext()
  const variants = useMemo<Variants>(
    () => ({
      drawer: {
        x: isSidebarOpen ? -27 : -width,
      },
    }),
    [isSidebarOpen],
  )
  return (
    <motion.div
      variants={variants}
      initial="drawer"
      animate="drawer"
      className={'absolute w-sm inset-0 z-10 bg-l-black/90'}
    >
      <ul className="">
        {menuData.map(data => (
          <MenuItem key={data.href} {...data} />
        ))}
      </ul>
    </motion.div>
  )
}

const MenuItem = ({ text, href, buttonProps }: (typeof menuData)[number]) => {
  return <></>
}
