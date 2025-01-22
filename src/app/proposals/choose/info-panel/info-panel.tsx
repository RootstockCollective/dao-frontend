import { HTMLMotionProps, motion } from 'motion/react'
import exampleImage from '../images/proposal.png'
import { HeaderTitle, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { MustHave } from '../cards'

interface InfoPanelProps extends HTMLMotionProps<'div'> {
  mustHaveList: MustHave[]
}

export function InfoPanel({ mustHaveList, className }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={cn(className, 'w-full flex flex-row bg-[#1A1A1A] overflow-hidden')}
    >
      <div className="p-7">
        <HeaderTitle className="text-[32px] uppercase leading-tight">Must have</HeaderTitle>
        <Typography tagVariant="p" className="text-lg leading-tight">
          A list of items you should have done to be able to submit a standard proposal
        </Typography>
      </div>
      <div></div>
    </motion.div>
  )
}
