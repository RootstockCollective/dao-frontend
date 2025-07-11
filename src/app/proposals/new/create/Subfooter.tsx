import { Button } from '@/components/ButtonNew'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props {
  submitForm: () => void
}

export const Subfooter = ({ submitForm }: Props) => {
  const router = useRouter()
  const { isSidebarOpen } = useLayoutContext()
  const isDesktop = useIsDesktop()
  // don't show on mobile with open menu
  if (!isDesktop && isSidebarOpen) return null
  return (
    <motion.div
      initial={{ y: 96 }}
      animate={{ y: 0 }}
      exit={{ y: 96 }}
      transition={{ ease: 'easeOut', duration: 0.3 }}
      className="sticky bottom-0 z-40"
    >
      <div className="h-[96px] flex items-center justify-center gap-2 bg-bg-60">
        <Button onClick={router.back} variant="secondary-outline">
          Back
        </Button>
        <Button onClick={submitForm}>Review proposal</Button>
      </div>
    </motion.div>
  )
}
