import { FC } from 'react'
import { motion, Variants } from 'framer-motion'

/**
 * This "shimmer" animation simply moves the background gradient
 * from left to right continuously.
 */
const shimmerVariants: Variants = {
  start: { backgroundPosition: '0% 0%' },
  end: {
    backgroundPosition: '-200% 0%',
    transition: {
      duration: 1.2,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

export const CardPlaceholder: FC = () => (
  <div className="rounded bg-input-bg w-[300px] pb-4" data-testid="CommunityCardPlaceholder">
    {/* Image placeholder */}
    <motion.div
      className="w-full h-[300px] mb-5 rounded-b-md"
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
        backgroundSize: '200% 100%',
      }}
      variants={shimmerVariants}
      initial="start"
      animate="end"
    />

    <div className="px-4">
      {/* Title placeholder (18px high) */}
      <motion.div
        className="h-4 mb-1 px-4 rounded-full p-1"
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
          backgroundSize: '200% 100%',
        }}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />

      {/* Description placeholder (14px high) */}
      <motion.div
        className="h-4 px-4 rounded-md p-1"
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
          backgroundSize: '200% 100%',
        }}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />

      {/* Members placeholder (14px high) */}
      <motion.div
        className="h-4 mt-2 px-4 pb-4 rounded-md"
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
          backgroundSize: '200% 100%',
        }}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />
    </div>
  </div>
)
