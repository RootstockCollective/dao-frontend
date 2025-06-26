import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  image: string
  topTitle: string
  topBlock: React.FC<HTMLElement>
  bottomTitle: string
  bottomBlock: React.FC<HTMLElement>
  topButtonText: string
  bottomButtonText: string
}

export function NewProposalCard({ isOpen, image, className, ...props }: Props) {
  return (
    <div className={cn('rounded-sm', className)} {...props}>
      <motion.div></motion.div>
    </div>
  )
}
