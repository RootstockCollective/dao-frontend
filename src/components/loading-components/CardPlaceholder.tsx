import { FC } from 'react'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'

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
    <div className="relative w-full h-[300px] mb-5">
      <Image
        src="/images/loading-card.png"
        alt={'Communities Image Placeholder'}
        fill
        sizes="300px"
        className="object-cover"
      />
      {/* The shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 37%, #f0f0f0 63%)',
          backgroundSize: '200% 100%',
          opacity: 0.6, // Tweak for how strongly you want to obscure the image
        }}
        variants={shimmerVariants}
        initial="start"
        animate="end"
      />
    </div>

    <div className="px-4">
      {/* Title placeholder (18px high) */}
      <motion.div
        className="h-1 mb-2 px-4"
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
        className="h-1 px-4"
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
