'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { useReducer } from 'react'
import { BackingContext, initialState } from '.'
import { BackingActionsContext } from './BackingActionsContext'

export const BackingProvider = ({ children }: CommonComponentProps) => {
  const [state, dispatch] = useReducer(() => ({}), initialState)

  return (
    <BackingContext value={state}>
      <BackingActionsContext value={dispatch}>{children}</BackingActionsContext>
    </BackingContext>
  )
}

export const withBackingContext = (Component: React.ComponentType<CommonComponentProps>) => {
  const WrappedComponent = (props: CommonComponentProps) => {
    return (
      <BackingProvider>
        <Component {...props} />
      </BackingProvider>
    )
  }
  WrappedComponent.displayName = `withBackingContext(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}
