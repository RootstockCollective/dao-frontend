import { Table } from '@/components/Table'
import { HeaderTitle, Span } from '@/components/Typography'
import { EXPLORER_URL, STRIF_ADDRESS } from '@/lib/constants'
import { RxExternalLink } from 'react-icons/rx'
import { useFetchTokenHolders } from '@/app/treasury/hooks/useFetchTokenHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { formatNumberWithCommas } from '@/lib/utils'
import { formatUnits } from 'ethers'

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
      <Jdenticon className="rounded-full bg-white mr-1" value={address} size="30" />
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px]">
        {rns || address}
      </Span>
      <RxExternalLink size={18} />
    </a>
  )
}

export const HoldersSection = () => {
  // Fetch st rif holders
  const { currentResults, paginationElement, isLoading, isError } = useFetchTokenHolders(STRIF_ADDRESS)

  const holders = currentResults.map(({ address, value }) => ({
    holder: <HolderColumn address={address.hash} rns={address.ens_domain_name} />,
    quantity: `${formatNumberWithCommas(formatUnits(value).split('.')[0])} stRIF`,
  }))

  return (
    <div>
      <HeaderTitle className="mb-4">Holders</HeaderTitle>
      {isError && (
        <ErrorMessageAlert message="An error occurred loading Token Holders. Please try again shortly." />
      )}
      {!isError && holders?.length > 0 && (
        <>
          <Table data={holders} />
          {paginationElement}
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
