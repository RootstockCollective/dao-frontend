import { DelegatesContainer } from '@/app/delegate/Sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/components/DelegateContext'
import { DelegateCard } from '@/app/delegate/components'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { Address } from 'viem'
import { useState } from 'react'
import Image from 'next/image'

export const ConnectedSection = () => {
  const { didIDelegateToMyself, delegateeAddress } = useDelegateContext()
  const [shouldShowDelegates, setShouldShowDelegates] = useState(false)

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
  }

  // @TODO use the delegate info from the context to populate this data
  return (
    <>
      {!didIDelegateToMyself && delegateeAddress && (
        <div className="flex flex-row bg-bg-80 p-[24px]">
          <DelegateCard
            address={delegateeAddress as Address}
            since="May 2025"
            votingPower={0}
            delegators={0}
            votingWeight="0"
            totalVotes="0"
            onDelegate={() => console.log('Here we should trigger RECLAIM')}
            delegateButtonText="Reclaim"
            delegateButtonVariant="primary"
          />
          <div className="flex flex-col ml-[32px] w-full">
            {/* Banner here with delegation perks */}
            <div className="text-bg-100 p-[24px] relative mb-[110px] bg-gradient-to-r from-[#E3FFEB] via-[#66CD8E] to-[#00031E]">
              <Image
                src="/images/banner/delegate-squares.svg"
                alt="Squares Divider"
                width={50}
                height={40}
                className="absolute left-[0px] -bottom-[30px] z-10 hidden md:block"
              />
              <Header variant="e3" className="text-bg-100 leading-[40px] text-[20px]">
                DELEGATION PERKS
              </Header>
              <ul className="list-[circle] list-inside">
                <li>
                  <Span>tokens stay in your wallet</Span>
                </li>
                <li>
                  <Span>you save on gas cost while being represented</Span>
                </li>
                <li>
                  <Span>your Rewards will keep accumulating as usual</Span>
                </li>
              </ul>
            </div>
            <Paragraph>
              You selected <span className="text-primary">{delegateeAddress}</span> to make governance your
              behalf.{' '}
            </Paragraph>
            <Paragraph>You only delegated your own voting power, not your tokens.</Paragraph>
            {/* Update delegate button here */}
            <Button
              variant="secondary-outline"
              onClick={onShowDelegates}
              className="w-[fit-content] mt-[24px]"
            >
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
