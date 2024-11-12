import { useAlertContext } from '@/app/providers/AlertProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { HeaderTitle } from '@/components/Typography'
import React, { useEffect } from 'react'
import { WhitelistGrid, WhitelistSearch } from './components'
import { useWhitelistContext } from './context'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

export const WhitelistSection = () => {
  const { builders, isLoading, error: whitelistError } = useWhitelistContext()
  const { setMessage: setErrorMessage } = useAlertContext()

  useEffect(() => {
    if (whitelistError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading proposals state',
        content: whitelistError.message,
      })
      console.error('🐛 whitelistError:', whitelistError)
    }
  }, [whitelistError, setErrorMessage])

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <HeaderTitle>Activated Builders</HeaderTitle>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <WhitelistSearch />

          {withSpinner(WhitelistGrid)({ isLoading, items: builders })}
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
