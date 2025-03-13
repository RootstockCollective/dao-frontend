'use client'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { HTMLAttributeAnchorTarget } from 'react'

interface ViewDetailsButtonProps {
  href: string
  textForButton?: string
  target?: HTMLAttributeAnchorTarget
}
export const ViewDetailsButton = ({
  href,
  textForButton = 'View details',
  target,
}: ViewDetailsButtonProps) => (
  <Link href={href} className="flex justify-center my-[16px] flex-0" target={target}>
    <Button variant="secondary" className="bg-foreground">
      {textForButton}
    </Button>
  </Link>
)
