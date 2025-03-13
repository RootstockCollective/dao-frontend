'use client'
import { ReactNode, createContext, useContext, useState } from 'react'
import { Address } from 'viem'
import { useRouter } from 'next/navigation'
import { useCommunity } from '@/shared/hooks/useCommunity'
import { useStRif } from '@/shared/hooks/useStRIf'
import { communitiesMapByContract, CommunityItem } from '@/app/communities/communityUtils'
import { useAlertContext } from '@/app/providers'
import { useAccount } from 'wagmi'
import { nftAlertMessages } from '@/app/communities/nft/[address]/constants'

interface CommunityNFTContextProps {
  // NFT Information Management
  nftInfo: CommunityItem
  isNFTRegistered: boolean

  // Community info
  title: string
  name: string
  image: string
  description: string
  nftAddress: string

  // Minting and Claim Logic
  isChecking: boolean
  handleMinting: () => Promise<void>
  doAdditionalChecks: (
    additionalChecks: Array<{
      name: string
      check: (data: any) => boolean // @TODO refine data
      alertMessage: string
    }>,
  ) => Promise<boolean>
  isClaiming: boolean

  // Membership state
  isMember: boolean
  membersCount: number
  isMintable?: boolean

  // Community Data
  tokensAvailable: number
  onReadFunctions: (functions: Array<{ functionName: string; args: string[] }>) => Promise<any>
  nftMeta: any | null // @TODO refine
  tokenId?: number
  nftName?: string
  nftSymbol?: string
  stRifThreshold?: bigint
}

const CommunityNFTContext = createContext<CommunityNFTContextProps | null>(null)

interface CommunityNFTProviderProps {
  children: ReactNode
  nftAddress: Address
}

/**
 * Context to use for communities page.
 * This is a WIP as it has to be divided. It's doing way too many things.
 * @param children
 * @param nftAddress
 * @constructor
 */
export function CommunityNFTProvider({ children, nftAddress }: CommunityNFTProviderProps) {
  const router = useRouter()
  const { setMessage } = useAlertContext()
  const { address } = useAccount()
  const {
    tokensAvailable,
    isMember,
    tokenId,
    membersCount,
    nftName,
    nftSymbol,
    mint: { onMintNFT, isPending: isClaiming },
    onReadFunctions,
    nftMeta,
    stRifThreshold,
  } = useCommunity(nftAddress)

  const { stRifBalance } = useStRif()

  // NFT Information Management
  const nftInfo = communitiesMapByContract[nftAddress.toLowerCase() || '']
  const isNFTRegistered = !!nftInfo

  if (nftAddress && !isNFTRegistered) {
    console.warn('The current NFT address is not registered. Please check the config.')
  }

  // Minting and Claim Logic
  const [isChecking, setIsChecking] = useState(false)

  const doAdditionalChecks = async (
    additionalChecks: Array<{
      name: string
      check: (data: any) => boolean
      alertMessage: string
    }>,
  ): Promise<boolean> => {
    for (const { name, check, alertMessage } of additionalChecks) {
      setIsChecking(true)
      let functions: { functionName: string; args: string[] }[] | undefined
      if (name === 'hasVoted') {
        functions = [{ functionName: 'hasVoted', args: [address as string] }]
      } else if (name === 'mintLimitReached') {
        functions = [
          { functionName: 'mintLimit', args: [] },
          { functionName: 'totalSupply', args: [] },
        ]
      }
      if (!functions) continue
      try {
        const data = await onReadFunctions(functions)
        const result = check(data)
        if (!result) {
          setIsChecking(false)
          setMessage(nftAlertMessages.NFT_ALERT_GENERIC(alertMessage))
          return false
        }
      } catch (err) {
        console.warn(err)
      }
    }
    setIsChecking(false)
    return true
  }

  const handleMinting = async () => {
    // check if user's stRIF Balance is more than required threshold to get a reward NFT
    if (stRifBalance < (stRifThreshold ?? 0n))
      return setMessage(
        nftAlertMessages.NFT_BALANCE_ALERT(nftInfo?.title, stRifThreshold as bigint, () =>
          router.push('/user?action=stake'),
        ),
      )

    if (nftInfo.additionalChecks) {
      const result = await doAdditionalChecks(nftInfo.additionalChecks)
      if (!result) return
    }

    onMintNFT()
      .then(() => {
        setMessage(nftAlertMessages.REQUESTED_TX_SENT())
      })
      .catch(err => {
        if (err.cause?.name !== 'UserRejectedRequestError') {
          console.error('ERROR', err)
          setMessage(nftAlertMessages.ERROR_CLAIMING_REWARD())
        }
      })
  }
  const value = {
    // NFT Information Management
    nftInfo,
    isNFTRegistered,
    nftAddress,

    // Community info
    title: nftInfo?.title || '',
    name: nftMeta?.name || 'Early Adopters NFT',
    image: nftMeta?.image || nftInfo?.cover || '',
    description: nftMeta?.description || '',

    // Minting and Claim Logic
    isChecking,
    handleMinting,
    doAdditionalChecks,
    isClaiming,

    // Community Data
    tokensAvailable,
    isMember,
    tokenId,
    membersCount,
    isMintable: nftInfo?.isMintable,

    nftName,
    nftSymbol,
    nftMeta,
    stRifThreshold,
    onReadFunctions,
  }

  return <CommunityNFTContext.Provider value={value}>{children}</CommunityNFTContext.Provider>
}

export const useCommunityNFT = () => {
  const context = useContext(CommunityNFTContext)
  if (!context) {
    throw new Error('useCommunityNFT must be used within a CommunityNFTProvider')
  }
  return context
}
