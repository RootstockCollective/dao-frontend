import Image from 'next/image'
import { Address } from 'viem'
import { useFetchNftHolders } from '@/shared/hooks/useFetchNftHolders'
import { HeaderTitle, Paragraph, Span } from '@/components/Typography'
import { Table } from '@/components/Table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EXPLORER_URL } from '@/lib/constants'
import { ExternalLinkIcon } from '@/components/Icons'
import { truncateMiddle } from '@/lib/utils'
import { useState } from 'react'
import { TableIcon } from '@/app/communities/TableIcon'
import { SquareIcon } from '@/app/communities/SquareIcon'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { HolderColumn } from '../_components/HolderColumn'
import { applyPinataImageOptions } from '@/lib/ipfs'

interface IdNumberColumnProps {
  id: string
  image?: string
}
const IdNumberColumn = ({ id, image }: IdNumberColumnProps) => {
  return (
    <div className="flex items-center gap-1.5">
      <Image
        unoptimized
        src={image || '/images/holders-square.png'}
        width={24}
        height={24}
        alt="Holders Image Square"
      />
      <span className="tracking-widest">#{id}</span>
    </div>
  )
}

interface CardHolderParagraphProps {
  address: string
  image: string
}
const CardHolderParagraph = ({ address, image }: CardHolderParagraphProps) => {
  // getting an image from Pinata a little bigger than the page size to make the image more detailed
  const optimizedImageUrl = applyPinataImageOptions(image, { width: 40, height: 40 })
  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      className="flex gap-1.5 text-white items-center"
    >
      <Paragraph fontFamily="kk-topo" size="large" className="pt-[6px]">
        HOLDER
      </Paragraph>
      <Image unoptimized src={optimizedImageUrl} width={24} height={24} alt="Holders Image" />
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px]">
        {truncateMiddle(address, 5, 5)}
      </Span>
      <ExternalLinkIcon size={18} />
    </a>
  )
}

interface CardProps {
  image: string
  id: string
  holderAddress: string
}

const Card = ({ image, id, holderAddress }: CardProps) => {
  // getting an image from Pinata a little bigger than the actual size to make the image more detailed
  const optimizedImageUrl = applyPinataImageOptions(image, { width: 320, height: 320 })
  return (
    <div className="w-[272px] bg-foreground">
      <Image unoptimized src={optimizedImageUrl} width={272} height={272} alt="NFT" />
      <div className="px-[8px] py-[16px]">
        <Paragraph fontFamily="kk-topo" size="large">
          ID# {id}
        </Paragraph>
        <CardHolderParagraph address={holderAddress} image={image} />
      </div>
    </div>
  )
}

interface CardViewProps {
  nfts: { image_url: string; id: string; owner: string; ens_domain_name?: string }[]
}

const CardView = ({ nfts }: CardViewProps) => (
  <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-y-4">
    {nfts.map(({ image_url, id, owner, ens_domain_name }) => (
      <Card key={id} image={image_url} id={id} holderAddress={ens_domain_name || owner} />
    ))}
  </div>
)

type ViewState = 'images' | 'table'

const ViewIconHandler = ({
  view,
  onChangeView,
}: {
  view: ViewState
  onChangeView: (view: ViewState) => void
}) => (
  <span className="absolute right-0 top-0 flex">
    <div
      className={`w-[46px] h-[46px] flex items-center justify-center ${view === 'table' ? 'bg-white' : ''}`}
      onClick={() => onChangeView('table')}
    >
      <TableIcon color={view === 'table' ? 'black' : 'white'} />
    </div>
    <div
      className={`w-[46px] h-[46px] flex items-center justify-center ${view === 'images' ? 'bg-white' : ''}`}
      onClick={() => onChangeView('images')}
    >
      <SquareIcon color={view === 'images' ? 'black' : 'white'} />
    </div>
  </span>
)

interface HoldersSectionProps {
  address: Address
}
export const NftHoldersSection = ({ address }: HoldersSectionProps) => {
  const { currentResults, paginationElement, isLoading, isError } = useFetchNftHolders(address)

  const [view, setView] = useState<ViewState>('table')

  const onChangeView = (selectedView: ViewState) => {
    setView(selectedView)
  }

  const holders = currentResults.map(({ owner, ens_domain_name, id, image_url }) => {
    const icon = applyPinataImageOptions(image_url, { width: 40, height: 40 })
    return {
      holder: <HolderColumn address={owner} rns={ens_domain_name || ''} image={icon} />,
      'ID Number': <IdNumberColumn id={id} image={icon} />,
    }
  })

  return (
    <div className="pl-4 relative">
      <HeaderTitle className="mb-[24px]">
        Holders
        <ViewIconHandler view={view} onChangeView={onChangeView} />
      </HeaderTitle>
      {isError ? (
        <ErrorMessageAlert message="An error occurred loading NFT Holders. Please try again shortly." />
      ) : (
        <>
          {view === 'table' && holders.length > 0 && <Table data={holders} />}
          {view === 'images' && currentResults.length > 0 && <CardView nfts={currentResults} />}
          <div className="mt-6">{paginationElement}</div>
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
