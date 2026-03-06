'use client'

import { ChevronDownIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { HTMLAttributes, useState } from 'react'

import { Link } from '@/components/Link'
import { Span } from '@/components/Typography'

import { usefulLinksData } from './usefulLinksData'

export const UsefulLinks = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={className} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-full items-center justify-between py-3 cursor-pointer"
      >
        <Span variant="tag" className="text-warm-gray">
          Useful links
        </Span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
          <ChevronDownIcon className="w-5 h-5 text-warm-gray" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              height: { duration: 0.3 },
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: 'hidden' }}
            className="space-y-1"
          >
            {usefulLinksData.map(({ href, testId, content }) => (
              <li key={href}>
                <Link
                  href={href}
                  variant="menu"
                  className="text-sm text-warm-gray no-underline hover:underline"
                  target="_blank"
                  data-testid={testId}
                >
                  <Span variant="body-s" bold>
                    {content}
                  </Span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
