import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Address, isAddress } from 'viem'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { Span } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { useState, ChangeEvent, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CloseIconKoto } from '@/components/Icons'
import { produce } from 'immer'
import { validateRnsDomain } from '@/app/delegate/lib/utils'
import { debounce } from 'lodash'

interface Props {
  didIDelegateToMyself: boolean
  onDelegate: (address: Address, rns?: string) => void
  onCloseClick?: () => void
}

export const DelegatesContainer = ({ didIDelegateToMyself, onDelegate, onCloseClick }: Props) => {
  const [addressToDelegate, setAddressToDelegate] = useState({
    userInput: '',
    address: '',
    rns: '',
    status: '',
    statusMessage: '',
  })

  const delegates = useNftHoldersWithVotingPower()

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

  const onValidateAddress = useCallback(
    debounce(async (userInput: string) => {
      // First check if the address is a valid address
      if (!isAddress(userInput) && !userInput.endsWith('.rsk')) {
        // Not valid
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
        if (isValidRNS.valid) {
          setAddressToDelegate(
            produce(draft => {
              draft.address = isValidRNS.address
              draft.rns = isValidRNS.domain
              draft.status = 'valid'
              draft.statusMessage = 'Valid RNS domain'
            }),
          )
          return
        }
      } else {
        // If we reach this point, this means the address is not RNS and is valid
        setAddressToDelegate(
          produce(draft => {
            draft.status = 'valid'
            draft.statusMessage = ''
            draft.address = userInput
          }),
        )
      }
    }, 1000), // Debounce for 1 second
    [],
  )

  const onUpdateDelegate = () => {
    if (addressToDelegate.status === 'valid') {
      onDelegate(addressToDelegate.address as Address, addressToDelegate.rns)
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
    <div className="bg-bg-80 mt-[8px] p-[24px]">
      <div className="mb-[10px] flex flex-col items-center">
        {!didIDelegateToMyself && (
          <CloseIconKoto
            className="self-end cursor-pointer"
            onClick={onCloseClick}
            data-testid="closeDelegatesContainer"
          />
        )}
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
            'w-full max-w-md bg-bg-60 placeholder:text-[16px] font-rootstock-sans px-[16px] py-[16px] mt-4 rounded text-white placeholder-bg-0',
            isAddressInvalid && 'border border-red-500',
          )}
          onChange={onDelegateChangeAddress}
          data-testid="delegateInput"
        />
        <div className="flex flex-col items-center gap-2 mb-[40px]">
          <Button
            variant="primary"
            className="mt-3 w-[fit-content]"
            onClick={onUpdateDelegate}
            disabled={!(addressToDelegate.status === 'valid')}
            data-testid="delegateButton"
          >
            {didIDelegateToMyself ? 'Delegate' : 'Update delegate'}
          </Button>
          {addressToDelegate.status === 'pending' && <p>Validating...</p>}
          {isAddressInvalid && <p>Error: {addressToDelegate.statusMessage}</p>}
          {addressToDelegate.rns && <p>RNS Valid! Address: {addressToDelegate.address}</p>}
        </div>
        <Span>or select one of the delegates vetted by the community</Span>
      </div>
      <div className="flex flex-row flex-wrap gap-[8px] justify-center mt-6">
        {delegates.map(delegate => (
          <DelegateCard
            key={delegate.address}
            address={delegate.address as Address}
            name={delegate.RNS || undefined}
            // @TODO fetch since
            since="May 2025"
            votingPower={delegate.votingPower?.toString() || 0}
            // @TODO fetch voting weight
            votingWeight=" - "
            // @TODO fetch total votes
            totalVotes={' - '}
            // @TODO fetch delegators
            delegators={' - '}
            onDelegate={onDelegate}
          />
        ))}
      </div>
    </div>
  )
}
