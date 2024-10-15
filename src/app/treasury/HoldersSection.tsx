import { Table } from '@/components/Table'
import { HeaderTitle, Span } from '@/components/Typography'
import { EXPLORER_URL, STRIF_ADDRESS } from '@/lib/constants'
import { RxExternalLink } from 'react-icons/rx'
import { useFetchTokenHolders } from '@/app/treasury/hooks/useFetchTokenHolders'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/Button'
import { ReactNode } from 'react'

interface HolderColumnProps {
  address: string
  rns?: string
}
const HolderColumn = ({ address, rns }: HolderColumnProps) => {
  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      className="mt-2 flex items-center gap-1.5 text-white"
    >
      <Image src="/images/treasury/holders.png" width={24} height={24} alt="Holders Image" />
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px]">
        {rns || address}
      </Span>
      <RxExternalLink size={18} />
    </a>
  )
}

export const HoldersSection = () => {
  // Fetch st rif holders
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFetchTokenHolders(STRIF_ADDRESS)

  const holders = data?.pages?.reduce<{ holder: ReactNode; quantity: string }[]>((prev, currentPage) => {
    currentPage.items.forEach(({ address, value }) => {
      prev.push({
        holder: <HolderColumn address={address.hash} rns={address.ens_domain_name} />,
        quantity: `${formatBalanceToHuman(value)} stRIF`,
      })
    })
    return prev
  }, [])

  return (
    <div>
      <HeaderTitle className="mb-4">Holders</HeaderTitle>
      {holders && holders?.length > 0 && <Table data={holders} />}
      {isLoading && <LoadingSpinner />}
      {isFetchingNextPage ? (
        <LoadingSpinner className="w-52" />
      ) : hasNextPage ? (
        <Button variant="secondary" onClick={() => fetchNextPage()}>
          Load more
        </Button>
      ) : null}
    </div>
  )
}
