'use client'

import { Button } from '@/components/ButtonNew'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CreateNewProposal() {
  const router = useRouter()
  const { openDrawer } = useLayoutContext()
  useEffect(() => {
    openDrawer(
      <div className="h-[96px] w-full flex items-center justify-center gap-2 bg-bg-60">
        <Button onClick={router.back} variant="secondary-outline">
          Back
        </Button>
        <Link href={''}>
          <Button>Review proposal</Button>
        </Link>
      </div>,
    )
  }, [])
  return <div>CreateNewProposal</div>
}
