'use client'
import {
  communitiesMapByContract,
  CommunityItem,
  AdditionalCheck,
  ContractReadResult,
} from '@/app/communities/communityUtils'
import { nftAlertMessages } from '@/app/communities/nft/[address]/constants'
import { NoContextProviderError } from '@/lib/errors/ContextError'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { useCommunity } from '@/shared/hooks/useCommunity'
import { useStRif } from '@/shared/hooks/useStRIf'
import { showToast } from '@/shared/notification'
import { NftMeta } from '@/shared/types'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

interface CommunityNFTContextProps {
  // NFT Information Management
  nftInfo: CommunityItem | undefined
  isNFTRegistered: boolean

  // Community info
  title: string
  name: string
  image: string
  description: string
  nftAddress: Address

  // Minting and Claim Logic
  isChecking: boolean
  handleMinting: () => Promise<void>
  doAdditionalChecks: (additionalChecks: AdditionalCheck[]) => Promise<boolean>
  isClaiming: boolean

  // Membership state
  isMember: boolean
  membersCount: number
  isMintable?: boolean

  // Community Data
  tokensAvailable: number
  onReadFunctions: (functions: Array<{ functionName: string; args: string[] }>) => Promise<ContractReadResult>
  nftMeta: NftMeta | undefined
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

  const doAdditionalChecks = async (additionalChecks: AdditionalCheck[]): Promise<boolean> => {
    for (const { name, check, alertMessage } of additionalChecks) {
      setIsChecking(true)
      let functions: { functionName: string; args: string[] }[] | undefined
      if (name === 'hasVoted') {
        if (!address) {
          setIsChecking(false)
          return false
        }
        functions = [{ functionName: 'hasVoted', args: [address] }]
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
          showToast(nftAlertMessages.NFT_ALERT_GENERIC(alertMessage))
          return false
        }
      } catch (err) {
        console.warn('Error during additional checks:', err)
        setIsChecking(false)
        return false
      }
    }
    setIsChecking(false)
    return true
  }

  const handleMinting = async () => {
    if (!nftInfo) {
      console.error('Cannot mint: NFT info not found')
      return
    }

    // check if user's stRIF Balance is more than required threshold to get a reward NFT
    if (stRifBalance < (stRifThreshold ?? 0n)) {
      showToast(
        nftAlertMessages.NFT_BALANCE_ALERT(nftInfo.title, stRifThreshold ?? 0n, () =>
          router.push('/user?action=stake'),
        ),
      )
      return
    }

    if (nftInfo.additionalChecks) {
      const result = await doAdditionalChecks(nftInfo.additionalChecks)
      if (!result) return
    }

    onMintNFT()
      .then(() => {
        showToast(nftAlertMessages.REQUESTED_TX_SENT())
      })
      .catch((err: unknown) => {
        // Only show error if user didn't explicitly reject the request
        const isUserRejection =
          err &&
          typeof err === 'object' &&
          'cause' in err &&
          (err.cause as { name?: string } | null)?.name === 'UserRejectedRequestError'

        if (!isUserRejection) {
          console.error('ERROR', err)
          showToast(nftAlertMessages.ERROR_CLAIMING_REWARD())
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
    image: applyPinataImageOptions(nftMeta?.image || nftInfo?.cover, {
      width: 600,
      height: 600,
    }),
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
    throw new NoContextProviderError('useCommunityNFT', 'CommunityNFTProvider')
  }
  return context
}
