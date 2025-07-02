'use client'
import { DelegateContextState } from '@/app/delegate/components/types'
import { defaultCardsState } from '@/app/delegate/components/constants'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { produce } from 'immer'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'

const initialValue: DelegateContextState = {
  cards: defaultCardsState,
  didIDelegateToMyself: false,
}

const DelegateContext = createContext<DelegateContextState>(initialValue)

// Custom hook to use the context
export const useDelegateContext = (): DelegateContextState => {
  const context = useContext(DelegateContext)
  if (context === undefined) {
    throw new Error('useDelegateContext must be used within a CardsProvider')
  }
  return context
}

interface Props {
  children: ReactNode
}

export const DelegateContextProvider = ({ children }: Props) => {
  const [data, setData] = useState({ ...initialValue })
  const { address } = useAccount()

  const {
    amount: received,
    delegated,
    own,
    available,
    didIDelegateToMyself,
    delegateeAddress,
  } = useGetExternalDelegatedAmount(address)

  // @TODO make a hook to fetch delegatee info then add it to context
  // Info such as delegated since, voting weight, delegators, voting power, total votes?

  useEffect(() => {
    setData(
      produce(draft => {
        draft.cards.received.contentValue = formatEther(received)
        draft.cards.own.contentValue = formatEther(own)
        draft.cards.delegated.contentValue = formatEther(delegated)

        draft.cards.available.contentValue = formatEther(available)

        draft.didIDelegateToMyself = didIDelegateToMyself
        draft.delegateeAddress = delegateeAddress
      }),
    )
  }, [received, delegated, own, available, didIDelegateToMyself, delegateeAddress])

  return <DelegateContext.Provider value={data}>{children}</DelegateContext.Provider>
}
