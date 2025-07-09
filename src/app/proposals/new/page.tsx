'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, Variants } from 'motion/react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Deactivation } from './Deactivation'
import { NewProposalCard } from './NewProposalCard'
import { newProposalCards } from './newProposalCards.data'
import { Paragraph } from '@/components/TypographyNew'
import { NewProposalCardExtended } from './NewProposalCardExtended'
import { ProposalCategory } from '@/shared/types'
import { useProposalStepper } from './stepper/StepperProvider'

const variants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
}
const proposalTypeSearchParam = 'type'
export default function NewProposal() {
  const path = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedCard = useMemo(() => {
    const proposalType = searchParams.get(proposalTypeSearchParam)
    if (!proposalType) return null
    return newProposalCards.find(card => card.type.toLowerCase() === proposalType.toLowerCase()) ?? null
  }, [searchParams])

  const onSelectProposal = useCallback(
    (type: ProposalCategory) => {
      const params = new URLSearchParams(searchParams)
      params.set(proposalTypeSearchParam, type)
      router.push(`${path}?${params}`)
    },
    [path, router, searchParams],
  )

  const cancelCardSelection = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete(proposalTypeSearchParam)
    const newUrl = params.toString() ? `${path}?${params}` : path
    router.push(newUrl)
  }, [path, router, searchParams])

  // set 'Type' proposal step
  const { setCurrentStep } = useProposalStepper()
  useEffect(() => {
    setCurrentStep('Type')
  }, [])

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {selectedCard === null ? (
          <motion.div key="selector" variants={variants} initial="initial" animate="animate" exit="exit">
            <Paragraph className="mb-6 leading-snug">
              Select the type of proposal that you want to create:
            </Paragraph>

            {/* 2 New Proposal Cards */}
            <div className="mb-2 w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-2">
              {newProposalCards.map((card, i) => (
                <NewProposalCard key={i} card={card} onSelectCard={onSelectProposal} />
              ))}
            </div>

            <Deactivation />
          </motion.div>
        ) : (
          <motion.div key="extended" variants={variants} initial="initial" animate="animate" exit="exit">
            {/* One extended card */}
            <NewProposalCardExtended card={selectedCard} cancelCardSelection={cancelCardSelection} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
