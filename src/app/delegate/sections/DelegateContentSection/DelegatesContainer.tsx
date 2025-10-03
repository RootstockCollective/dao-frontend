import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Address, formatEther, isAddress } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { Paragraph, Span } from '@/components/Typography'
import { Button } from '@/components/Button'
import { useState, ChangeEvent, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CloseIconKoto } from '@/components/Icons'
import { produce } from 'immer'
import { validateRnsDomain } from '@/app/delegate/lib/utils'
import { debounce } from 'lodash'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useReadContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'
import Big from '@/lib/big'

interface Props {
  didIDelegateToMyself: boolean
  onDelegate: (address: Address, rns?: string, imageIpfs?: string | null) => void
  onCloseClick?: () => void
}

export const DelegatesContainer = ({ didIDelegateToMyself, onDelegate, onCloseClick }: Props) => {
  const isDesktop = useIsDesktop()
  const [addressToDelegate, setAddressToDelegate] = useState({
    userInput: '',
    address: '',
    rns: '',
    status: '',
    statusMessage: '',
  })

  const delegates = useNftHoldersWithVotingPower()

  const { data: totalSupply } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })

  const delegatesWithWeight = useMemo(() => {
    if (!delegates || !totalSupply) return []

    const supplyNum = Big(formatEther(totalSupply))

    return delegates.map(nftHolder => {
      const votesNum = nftHolder.votingPower ? Big(nftHolder.votingPower.toString()) : Big(0)
      const percent = votesNum.div(supplyNum).times(100).toFixed(2)

      return {
        ...nftHolder,
        votingPowerPercent: percent,
      }
    })
  }, [delegates, totalSupply])

  const onDelegateChangeAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setAddressToDelegate(
      produce(draft => {
        draft.userInput = e.target.value
        draft.status = e.target.value.length > 0 ? 'pending' : ''
        draft.statusMessage = 'User is typing...'
        draft.rns = ''
      }),
    )
  }

  const onUpdateAddressStatus = (status: string, statusMessage: string = '') => {
    setAddressToDelegate(
      produce(draft => {
        draft.status = status
        draft.statusMessage = statusMessage
      }),
    )
  }

  const validateAddress = useCallback(async (userInput: string) => {
    if (!isAddress(userInput, { strict: false }) && !userInput.endsWith('.rsk')) {
      onUpdateAddressStatus('invalid', 'Invalid address')
      return
    }

    if (userInput.endsWith('.rsk')) {
      onUpdateAddressStatus('pending', 'Validating RNS domain...')
      const isValidRNS = await validateRnsDomain(userInput)
      if (!isValidRNS.valid) {
        onUpdateAddressStatus('invalid', isValidRNS.error || 'Invalid RNS domain')
        return
      }

      setAddressToDelegate(
        produce(draft => {
          draft.address = isValidRNS.address
          draft.rns = isValidRNS.domain
          draft.status = 'valid'
          draft.statusMessage = 'Valid RNS domain'
        }),
      )
    } else {
      setAddressToDelegate(
        produce(draft => {
          draft.status = 'valid'
          draft.statusMessage = ''
          draft.address = userInput
        }),
      )
    }
  }, [])

  const onValidateAddress = useMemo(() => debounce(validateAddress, 1000), [validateAddress])

  const onUpdateDelegate = () => {
    if (addressToDelegate.status === 'valid') {
      onDelegate(addressToDelegate.address as Address, addressToDelegate.rns, undefined)
    }
  }

  useEffect(() => {
    if (addressToDelegate.userInput.length > 0) {
      console.log('Validating address:', addressToDelegate.userInput)
      onValidateAddress(addressToDelegate.userInput)
    }
  }, [addressToDelegate.userInput, onValidateAddress])

  const isAddressInvalid = addressToDelegate.status === 'invalid'

  return (
    <div className="bg-bg-80 mt-2 p-6 md:p-6">
      <div className="flex flex-col items-center">
        {!didIDelegateToMyself && (
          <CloseIconKoto
            className="self-end cursor-pointer"
            onClick={onCloseClick}
            data-testid="closeDelegatesContainer"
          />
        )}
        <div className="flex flex-col items-center gap-3 w-full">
          <Span>
            {didIDelegateToMyself
              ? 'Input delegate to make governance decisions on your behalf'
              : 'Input a new delegate for your voting power'}
          </Span>
          <input
            type="text"
            name="address"
            placeholder="Delegate's RNS name or address"
            className={cn(
              'w-full max-w-md bg-bg-60 placeholder:text-base font-rootstock-sans p-4 mt-1 rounded text-white placeholder-bg-0',
              isAddressInvalid && 'border border-red-500',
            )}
            onChange={onDelegateChangeAddress}
            data-testid="delegateInput"
          />
          <Button
            variant="primary"
            onClick={onUpdateDelegate}
            className="max-w-md"
            disabled={!(addressToDelegate.status === 'valid')}
            data-testid="delegateButton"
          >
            {didIDelegateToMyself ? 'Delegate' : 'Update delegate'}
          </Button>
          <div className="flex flex-col items-center gap-2">
            {addressToDelegate.status === 'pending' && <Paragraph>Validating...</Paragraph>}
            {isAddressInvalid && <Paragraph>Error: {addressToDelegate.statusMessage}</Paragraph>}
            {addressToDelegate.rns && (
              <Paragraph>
                RNS Valid! Address: <br className="md:hidden" />
                <Span variant={isDesktop ? 'body-s' : 'body-xs'}>{addressToDelegate.address}</Span>
              </Paragraph>
            )}
          </div>
        </div>
        <Span className="mt-8 md:mt-10">or select one of the delegates vetted by the community</Span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2 mt-6">
        {delegatesWithWeight.map(delegate => (
          <DelegateCard
            key={delegate.address}
            address={delegate.address as Address}
            name={delegate.RNS || undefined}
            imageIpfs={delegate.imageIpfs}
            since={formatTimestampToMonthYear(delegate.delegatedSince)}
            votingPower={delegate.votingPower?.toString() || 0}
            votingWeight={`${delegate.votingPowerPercent}%`}
            totalVotes={delegate.totalVotes?.toString() || 0}
            delegators={delegate.delegators?.toString() || 0}
            onDelegate={onDelegate}
          />
        ))}
      </div>
    </div>
  )
}
