import { useAlertContext } from '@/app/providers/AlertProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { HeaderTitle } from '@/components/Typography'
import { useEffect } from 'react'
import { WhitelistGrid, WhitelistSearch } from './components'
import { useWhitelistContext } from './context'

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
    <div>
      <HeaderTitle>Whitelist</HeaderTitle>
      <WhitelistSearch />

      {/* TODO: We should show an empty table (not considered in the design yet) on error */}
      {isLoading && <LoadingSpinner />}
      {!isLoading && <WhitelistGrid items={builders} />}
    </div>
  )
}
