import { motion } from 'motion/react'
import { GridTable } from '@/components/Table'
import { Header } from '@/components/TypographyNew'
import { EXPLORER_URL, RIF, STRIF_ADDRESS } from '@/lib/constants'
import { GridIcon, ListIcon } from '@/components/Icons'
import { useFetchTokenHolders } from '@/app/treasury/hooks/useFetchTokenHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { Address, formatEther } from 'viem'
import { Span } from '@/components/TypographyNew'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Pagination } from '@/components/Paginaton'
import { useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { useSearchParams } from 'next/navigation'
import { getPaginationRowModel } from '@tanstack/react-table'
import { TokenImage } from '@/components/TokenImage'
import Big from 'big.js'
import { BuilderHeader } from '../backing/components/BuilderHeader/BuilderHeader'
import { useGetSpecificPrices } from '../user/Balances/hooks/useGetSpecificPrices'

interface HolderColumnProps {
  address: string
  rns?: string
}

const HolderColumn = ({ address, rns }: HolderColumnProps) => {
  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      className="flex items-center gap-1.5 text-white"
    >
      <Jdenticon className="rounded-full bg-white mr-1" value={address} size="30" />
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px] text-text-primary">
        {rns?.split('.')[0] || address}
      </Span>
    </a>
  )
}

interface HolderCardProps {
  amount: string
  address: string
  rns?: string
  price?: number
}

const formatAmount = (amount: string) => formatNumberWithCommas(formatEther(BigInt(amount)).split('.')[0])

const HolderCard = ({ address, rns, amount, price }: HolderCardProps) => (
  <div className="flex flex-col max-w-[256px] max-h-[284px] py-6 px-4 bg-bg-60 items-center justify-center">
    <BuilderHeader name={rns} address={address as Address} className="mt-2" />
    <div className="flex flex-col border-0.5 border-[1px] border-bg-40 p-3 text-left mt-5 w-full">
      <div className="flex items-center">
        <Header variant="h2">{formatAmount(amount)}</Header>
        <TokenImage className="ml-1" symbol="RIF" size={16} />
        <Span variant="tag-s" className="ml-1">
          stRIF
        </Span>
      </div>
      <Span variant="tag-s" className="text-bg-0 mt-2">
        {!price
          ? 0
          : Big(formatEther(BigInt(amount)))
              .mul(price)
              .toString()}{' '}
        USD
      </Span>
    </div>
  </div>
)

interface ListSwitchProps {
  isGridMode: boolean
  setIsGridMode: (_isGridMode: boolean) => void
}

const buttonStyle = {
  border: 0,
  width: '2.25rem', // w-9
  height: '2rem', // h-8
  padding: 0,
}

const ListSwitch = ({ isGridMode, setIsGridMode }: ListSwitchProps) => {
  return (
    <div className="flex flex-row bg-bg-100 items-center h-10 w-20 rounded-b-[18px] rounded-t-[18px] px-1">
      <motion.button
        onClick={() => setIsGridMode(false)}
        style={{
          ...buttonStyle,
          borderBottomLeftRadius: 18,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        animate={{
          backgroundColor: isGridMode ? 'rgba(0,0,0,0)' : 'rgba(55, 50, 47, 1)',
        }}
        transition={{
          duration: 0.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          animate={{
            color: isGridMode ? 'rgba(154, 148, 141, 1)' : 'rgba(255, 255, 255, 1)',
          }}
          transition={{
            duration: 0.3,
          }}
          className="ml-2"
          style={{ display: 'flex' }}
        >
          <ListIcon color={'currentColor'} />
        </motion.span>
      </motion.button>

      <motion.button
        onClick={() => setIsGridMode(true)}
        style={{
          ...buttonStyle,
          borderBottomRightRadius: 18,
          borderTopRightRadius: 18,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        animate={{
          backgroundColor: isGridMode ? 'rgba(55, 50, 47, 1)' : 'rgba(0,0,0,0)',
        }}
        transition={{
          duration: 0.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          animate={{
            color: isGridMode ? 'rgba(255, 255, 255, 1)' : 'rgba(154, 148, 141, 1)',
          }}
          transition={{
            duration: 0.3,
          }}
          style={{ display: 'flex' }}
        >
          <GridIcon className="ml-1" color="currentColor" />
        </motion.span>
      </motion.button>
    </div>
  )
}

interface HolderData {
  holder: {
    address: string
    rns: string
  }
  quantity: string
}

export const HoldersSection = () => {
  const prices = useGetSpecificPrices()
  // Fetch st rif holders
  const { currentResults, isLoading, isError } = useFetchTokenHolders(STRIF_ADDRESS)

  const holders: HolderData[] = currentResults.map(({ address, value }) => ({
    // holder: <HolderColumn address={address.hash} rns={address.ens_domain_name} />,
    holder: {
      address: address.hash,
      rns: address.ens_domain_name,
    },
    // quantity: formatNumberWithCommas(formatEther(BigInt(value)).split('.')[0]),
    quantity: value,
  }))

  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])
  const [isGridMode, setIsGridMode] = useState(false)

  const searchParams = useSearchParams()

  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))

  // Table data definition helper
  const { accessor } = createColumnHelper<(typeof holders)[number]>()
  const columns = [
    accessor('holder', {
      id: 'holder',
      header: 'Holder',
      cell: ({ row }) => <HolderColumn address={row.original.holder.address} rns={row.original.holder.rns} />,
    }),
    accessor('quantity', {
      id: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="flex flex-row">
          <Span variant="body-s">{formatAmount(row.original.quantity)}</Span>
          <TokenImage size={16} symbol="RIF" className="ml-2" />
          <Span variant="tag-s" className="ml-1">
            stRIF
          </Span>
        </div>
      ),
      sortingFn: (a, b) => {
        const quantityA = Big(a.original.quantity)
        const quantityB = Big(b.original.quantity)

        return quantityA.cmp(quantityB)
      },
    }),
  ]

  // create table data model which is passed to the Table UI component
  const table = useReactTable({
    columns,
    data: holders,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    // Prevent pagination reset on data change
    autoResetPageIndex: false,
  })

  return (
    <div className="bg-bg-80 p-6">
      <div className="flex flex-row justify-between">
        <Header variant="h3" className="mb-4">
          HOLDERS
        </Header>
        <ListSwitch isGridMode={isGridMode} setIsGridMode={setIsGridMode} />
      </div>

      {isError && (
        <ErrorMessageAlert message="An error occurred loading Token Holders. Please try again shortly." />
      )}
      {!isError && holders?.length > 0 && (
        <>
          {!isGridMode ? (
            <GridTable table={table} className="mt-8" rowStyles="py-2" />
          ) : (
            <div className="grid gap-2 grid-cols-4 mt-8">
              {holders.map(h => (
                <HolderCard
                  key={h.holder.address}
                  amount={h.quantity}
                  address={h.holder.address}
                  rns={h.holder.rns}
                  price={prices[RIF]?.price}
                />
              ))}
            </div>
          )}

          <Pagination pagination={pagination} setPagination={setPagination} data={holders} table={table} />
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
