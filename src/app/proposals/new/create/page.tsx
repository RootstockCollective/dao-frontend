'use client'

import { Button } from '@/components/ButtonNew'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useProposalStepper } from '../stepper/StepperProvider'

export default function CreateNewProposal() {
  const { setSubfooter } = useLayoutContext()
  const { setCurrentStep } = useProposalStepper()

  useEffect(() => {
    setCurrentStep('Details')
    setSubfooter(<Subfooter href="/dusya" />)
    return () => setSubfooter(null)
  }, [setSubfooter])
  return <div>CreateNewProposal</div>
}

const Subfooter = ({ href }: { href: string }) => {
  const router = useRouter()
  return (
    <div className="h-[96px] w-full flex items-center justify-center gap-2 bg-bg-60">
      <Button onClick={router.back} variant="secondary-outline">
        Back
      </Button>
      <Link href={href}>
        <Button>Review proposal</Button>
      </Link>
    </div>
  )
}