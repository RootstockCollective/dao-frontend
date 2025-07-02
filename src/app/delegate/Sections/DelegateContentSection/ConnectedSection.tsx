import { DelegatesContainer } from '@/app/delegate/Sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/components/DelegateContext'
import { DelegateCard, DelegateCardProps } from '@/app/delegate/components'
import { Paragraph } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { Address } from 'viem'
import { useEffect, useState } from 'react'

export const ConnectedSection = () => {
  const { didIDelegateToMyself, delegateeAddress } = useDelegateContext()
  const [shouldShowDelegates, setShouldShowDelegates] = useState(true)

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
  }

  // @TODO use the delegate info from the context to populate this data
  return (
    <>
      {!didIDelegateToMyself && delegateeAddress && (
        <div className="flex flex-row">
          <DelegateCard
            address={delegateeAddress as Address}
            since="May 2025"
            votingPower={0}
            delegators={0}
            votingWeight="0"
            totalVotes="0"
            onDelegate={() => console.log('Here we should trigger RECLAIM')}
            delegateButtonText="Reclaim"
          />
          <div className="flex">
            {/* Banner here with delegation perks */}
            <Paragraph>
              You selected {delegateeAddress} to make governance decisions on your behalf.{' '}
            </Paragraph>
            <Paragraph>You only delegated your own voting power, not your tokens.</Paragraph>
            {/* Update delegate button here */}
            <Button onClick={onShowDelegates}>
              {/* Pending edit icon here */}
              Update delegate
            </Button>
          </div>
        </div>
      )}
      {(shouldShowDelegates || didIDelegateToMyself) && <DelegatesContainer />}
    </>
  )
}
