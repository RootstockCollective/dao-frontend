import Image from 'next/image'
import { Address } from 'viem'
import { useFetchNftHolders } from '@/shared/hooks/useFetchNftHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EXPLORER_URL } from '@/lib/constants'
import { cn, truncateMiddle } from '@/lib/utils'
import { useState } from 'react'
import { applyPinataImageOptions, ipfsGatewayUrl } from '@/lib/ipfs'
import { Paragraph, Header, Span } from '@/components/TypographyNew'
import { ViewIconHandler, type ViewState } from './ViewIconHandler'
import {
  createColumnHelper,
  type SortingState,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table'
import { HoldersTable } from '../_components/HoldersTable'

const defaultImage = ipfsGatewayUrl('QmUSCZPeHVUtdScnnBfFbxUA5ndC3xw3oNBZ83BnfEKMyK/36.png')

interface CardProps {
  image: string
  id: string
  holderAddress: string
  format?: 'big' | 'small'
}

function Card({ image, id, holderAddress, format }: CardProps) {
  const optimizedImageUrl = applyPinataImageOptions(image, { width: 600, height: 600 })
  return (
    <div
      className={cn(
        'w-full aspect-4/5 bg-bg-60 rounded flex flex-col gap-[min(1rem,1vw)] p-[min(1rem,1.5vw)]',
        format === 'big' ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1',
      )}
    >
      <div className="grow relative w-full">
        <Image
          unoptimized
          src={optimizedImageUrl}
          fill
          alt="NFT"
          crossOrigin="anonymous"
          className="object-cover"
        />
      </div>
      <div className="w-full">
        <a
          href={`${EXPLORER_URL}/address/${holderAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline decoration-primary"
        >
          <Header
            variant="h3"
            className="text-primary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed tracking-tight truncate first-letter:uppercase"
          >
            {holderAddress}
          </Header>
        </a>
        <Paragraph className="text-xs md:text-sm lg:text-base">ID #{id}</Paragraph>
      </div>
    </div>
  )
}

interface CardViewProps {
  nfts: { image_url: string; id: string; owner: string; ens_domain_name?: string }[]
}

const CardView = ({ nfts }: CardViewProps) => (
  <div className="grid grid-cols-4 gap-2">
    {nfts.map(({ image_url, id, owner, ens_domain_name }, i) => (
      <Card
        key={id}
        image={image_url}
        id={id}
        holderAddress={ens_domain_name || truncateMiddle(owner, 5, 5)}
        format={i % 6 ? 'small' : 'big'}
      />
    ))}
  </div>
)

interface HoldersSectionProps {
  address: Address
}
export const NftHoldersSection = ({ address }: HoldersSectionProps) => {
  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])
  const [view, setView] = useState<ViewState>('table')
  const { currentResults, paginationElement, isLoading, isError } = useFetchNftHolders(address)

  const { accessor } = createColumnHelper<(typeof currentResults)[number]>()
  const columns = [
    accessor(({ ens_domain_name, owner }) => ens_domain_name ?? truncateMiddle(owner, 4, 4), {
      header: 'Holder',
      cell: ({ row, cell }) => {
        const icon = applyPinataImageOptions(row.original.image_url ?? defaultImage, {
          width: 120,
          height: 120,
        })
        return (
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
              <Paragraph className="text-primary first-letter:capitalize truncate">
                {cell.getValue()}
              </Paragraph>
            </a>
          </div>
        )
      },
      meta: {
        width: '1fr',
      },
    }),
    accessor('id', {
      header: 'ID Number',
      cell: ({ cell }) => <Paragraph>{cell.getValue()}</Paragraph>,
      meta: {
        width: 'max-content',
      },
    }),
  ]
  const table = useReactTable({
    columns,
    data: currentResults,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    autoResetPageIndex: true,
  })

  const onChangeView = (selectedView: ViewState) => {
    setView(selectedView)
  }

  // Early return: If not loading and either there are no holders or there's an error, don't render anything
  if (!isLoading && (currentResults.length === 0 || isError)) {
    return null
  }

  return (
    <div className="relative px-6 pt-4 pb-10 bg-bg-80 rounded overflow-hidden">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <Header caps className="text-xl inline mr-2">
            Holders
          </Header>
          {currentResults.length > 0 && <Span className="text-lg text-bg-0">{currentResults.length}</Span>}
        </div>
        {currentResults.length > 0 && <ViewIconHandler view={view} onChangeView={onChangeView} />}
      </div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && currentResults.length > 0 && (
        <>
          {view === 'table' && <HoldersTable table={table} />}
          {view === 'images' && <CardView nfts={currentResults} />}
          <div className="mt-6">{paginationElement}</div>
        </>
      )}
    </div>
  )
}
