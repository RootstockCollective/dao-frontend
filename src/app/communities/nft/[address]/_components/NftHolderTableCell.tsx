import Image from 'next/image'
import { Paragraph } from '@/components/TypographyNew/Paragraph'
import { EXPLORER_URL } from '@/lib/constants'
import type { Row, Cell } from '@tanstack/react-table'
import { type NftHolderItem } from '@/app/user/Balances/types'

interface Props {
  icon: string
  row: Row<NftHolderItem>
  cell: Cell<NftHolderItem, string>
}

export const NftHolderTableCell = ({ icon, row, cell }: Props) => (
  <div className="flex gap-4 items-center">
    <div className="relative shrink-0 w-25 md:w-30 aspect-square rounded-sm overflow-hidden">
      <Image
        unoptimized
        src={icon}
        alt={row.original.metadata.name}
        fill
        className="object-contain"
        crossOrigin="anonymous"
      />
    </div>
    <a
      href={`${EXPLORER_URL}/address/${row.original.owner}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline decoration-primary"
    >
      <Paragraph className="text-primary first-letter:capitalize truncate">{cell.getValue()}</Paragraph>
    </a>
  </div>
)
