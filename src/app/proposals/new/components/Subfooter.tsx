import { Button } from '@/components/ButtonNew'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props {
  submitForm: () => void
  buttonText: string
  disabled?: boolean
  nextDisabled?: boolean
  backDisabled?: boolean
}

export const Subfooter = ({
  submitForm,
  disabled = false,
  nextDisabled = false,
  backDisabled = false,
  buttonText,
}: Props) => {
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
        <Button disabled={backDisabled || disabled} onClick={router.back} variant="secondary-outline">
          Back
        </Button>
        <Button disabled={nextDisabled || disabled} onClick={submitForm}>
          {buttonText}
        </Button>
      </div>
    </motion.div>
  )
}
