import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { b } from 'vitest/dist/chunks/suite.d.FvehnV49.js'

interface AllocationBarTooltipProps {
  builderAddress: string
  currentBacking: number
}

export const AllocationBarTooltip = ({ builderAddress, currentBacking }: AllocationBarTooltipProps) => {
  console.log(builderAddress)

  return (
    <motion.div
      initial={{ opacity: 0, y: -5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-col p-2 hidden group-hover:flex absolute -top-8 left-5 bg-st-white rounded-md border z-[100000]"
    >
      <span className="font-medium text-sm font-rootstock-sans text-black">
        {builderAddress === 'unallocated'
          ? 'Unallocated'
          : builderAddress.slice(0, 6) + '...' + builderAddress.slice(-4)}
      </span>
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex justify-between items-center text-secondary gap-5">
          <p className="text-sm">Pending</p>
          <p className="font-medium">{currentBacking.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center text-secondary gap-5">
          <p className="text-sm whitespace-nowrap">Current backing</p>
          <p className="font-medium">{currentBacking.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  )
}
