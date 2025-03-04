'use client'
import { Button } from '@/components/Button'
import Link from 'next/link'

interface ViewDetailsButtonProps {
  nftAddress?: string
}
export const ViewDetailsButton = ({ nftAddress }: ViewDetailsButtonProps) => (
  <Link
    href={nftAddress ? `/communities/nft/${nftAddress}` : '/communities'}
    className="flex justify-center my-[16px] flex-0"
  >
    <Button variant="secondary" className="bg-foreground">
      View details
    </Button>
  </Link>
)
