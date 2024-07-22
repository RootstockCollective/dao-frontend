import { firstNft } from '@/app/communities/communityUtils'
import { NFTContextProvider } from '@/app/providers'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip/Chip'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactNode, useState } from 'react'
import { BsTwitterX } from 'react-icons/bs'
import { FaDiscord, FaLink } from 'react-icons/fa'
import { useCidsAvailable } from './hooks/useCidsAvailable'
import { useMintNFT } from './hooks/useMintNFT'
import { useNFTImage } from './hooks/useNFTImage'
import { DEFAULT_NFT_BASE64 } from './images/defaultNFT'
import { Address } from 'viem'

export default function Page() {
  const {
    query: { address: nftAddress },
  } = useRouter()

  const { cidsAvailable } = useCidsAvailable()
  const { onMintNFT } = useMintNFT()
  const [message, setMessage] = useState('')

  const { isLoadingImage: loadingNftImage, data: nftData } = useNFTImage(nftAddress as Address)
  const { imageUrl, alt, description, tokenId, owned } = nftData

  const handleMinting = () => {
    onMintNFT()
      .then(txHash => {
        console.log('SUCCESS', txHash)
        setMessage(
          'Request transaction sent. Your claim is in process. It will be visible when the transaction is confirmed.',
        )
      })
      .catch(err => {
        console.error('ERROR', err)
        setMessage(
          'Error claiming reward. An unexpected error occurred while trying to claim your reward. Please try again later. If the issue persists, contact support for assistance.',
        )
      })
  }

  if (!nftAddress) return null
  return (
    <MainContainer notProtected>
      {message && (
        <div
          className={cn(
            'bg-st-success bg-opacity-10 border border-st-success text-st-white rounded-md p-4 mb-4',
            message.includes('Error') ? 'bg-st-error border-st-error' : '',
          )}
        >
          {message}
        </div>
      )}
      <div className="flex justify-between pl-[16px] gap-[16px]">
        {/* 50%: NFT INFO*/}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Image src={firstNft.imageSrc} width={45} height={23} alt="Early" />
            <div>Early Adopters</div>
          </div>
          <div>
            Crypto ipsum bitcoin ethereum dogecoin litecoin. Hedera USD kadena chainlink arweave hive binance.
            Shiba-inu terra ICON IOTA ICON livepeer velas uniswap. Kadena kusama IOTA horizen.
          </div>
          <div className="flex gap-[8px] mt-[16px] mb-[24px]">
            {/* Chips with community links */}
            <Chip className="bg-white text-black">
              <BsTwitterX />
              <span>X</span>
            </Chip>
            <Chip className="bg-[rgba(74,102,247,1)] text-white">
              <FaDiscord />
              <span>Discord</span>
            </Chip>
            <Chip className="bg-primary text-white">
              <FaLink />
              <span>Website</span>
            </Chip>
          </div>
          {/* pioneer, holders, followers */}
          <div>
            <DivWithBorderTop
              firstParagraph={'Pioneer'}
              secondParagraph={
                <></>
                // <div className="flex gap-2 items-center">
                //   <span>Address here</span>
                //   <BiCopy />
                // </div>
              }
            />
            <DivWithBorderTop firstParagraph={'Holders'} secondParagraph={'494,466'} />
            <DivWithBorderTop firstParagraph={'Followers'} secondParagraph={'90,636'} />
          </div>
        </div>
        {/* 50%: NFT Image and Membership*/}
        <div className="flex-1">
          <div className="flex justify-end">
            {/* @TODO Define what we will do here because user is not supposed to burn the NFT */}
            {/*<Button*/}
            {/*  variant="transparent"*/}
            {/*  className="border-[1px] border-st-error"*/}
            {/*  textClassName="text-st-error"*/}
            {/*>*/}
            {/*  Leave Community*/}
            {/*</Button>*/}
          </div>
          <div>
            <Span className="mb-[24px] font-bold inline-block">Membership NFT</Span>
            <div className="grid grid-cols-[40%_60%] gap-[24px]">
              {!loadingNftImage && (
                <>
                  {imageUrl ? (
                    <Image alt={alt} src={imageUrl} className="w-full self-center" width={0} height={0} />
                  ) : (
                    <Image
                      alt="NFT"
                      src={DEFAULT_NFT_BASE64}
                      className="w-full self-center"
                      width={0}
                      height={0}
                    />
                  )}
                </>
              )}

              {owned ? (
                <div>
                  <Paragraph className="text-[18px]">Early Adopter #{tokenId.toString()}</Paragraph>
                  <Span className="my-[16px] inline-block text-st-success">Owned</Span>
                  <Span className="inline-block text-[14px] tracking-wide">{description}</Span>
                </div>
              ) : (
                <div>
                  {/* <Paragraph className="text-[18px]">Early Adopter #1203</Paragraph>
                  <NFTHandler disabled={!cidsAvailable} onMint={handleMinting} />
                  <Span className="inline-block text-[14px] tracking-wide">
                    Crypto ipsum bitcoin ethereum dogecoin litecoin. Hedera USD kadena chainlink arweave hive
                    binance. Shiba-inu terra ICON IOTA ICON livepeer velas uniswap. Kadena kusama IOTA
                    horizen.
                  </Span> */}
                  <Paragraph className="text-[18px]">Early Adopter</Paragraph>
                  <Button
                    variant="secondary-full"
                    className="my-[16px]"
                    onClick={handleMinting}
                    disabled={!cidsAvailable}
                  >
                    Claim it!
                  </Button>
                  <Span className="inline-block text-[14px] tracking-wide">
                    Crypto ipsum bitcoin ethereum dogecoin litecoin. Hedera USD kadena chainlink arweave hive
                    binance. Shiba-inu terra ICON IOTA ICON livepeer velas uniswap. Kadena kusama IOTA
                    horizen.
                  </Span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  )
}

interface DivWithBorderTopProps {
  firstParagraph: ReactNode
  secondParagraph: ReactNode
}

function DivWithBorderTop({ firstParagraph, secondParagraph }: DivWithBorderTopProps) {
  return (
    <div className="flex justify-between py-[24px] border-t-2 border-t-[rgba(255,255,255,0.4)]">
      <Paragraph>{firstParagraph}</Paragraph>
      <Paragraph>{secondParagraph}</Paragraph>
    </div>
  )
}
