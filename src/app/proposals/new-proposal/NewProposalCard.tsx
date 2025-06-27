import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  image: string
  topTitle: string
  topBlock: React.ReactNode
  bottomTitle: string
  bottomBlock: React.ReactNode
  topButtonText: string
  bottomButtonText: string
}

export function NewProposalCard({ isOpen, image, className, ...props }: Props) {
  return (
    <div className={cn('rounded-sm w-full max-w-[540px] bg-text-80', className)} {...props}>
      hello world
      <motion.div></motion.div>
    </div>
  )
}
