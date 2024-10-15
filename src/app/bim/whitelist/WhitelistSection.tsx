import { WhitelistGrid } from '@/app/bim/whitelist/WhitelistGrid'
import { WhitelistSearch } from '@/app/bim/whitelist/WhitelistSearch'
import { Paragraph } from '@/components/Typography'
import { useWhitelistContext } from '@/app/bim/whitelist/WhitelistContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAlertContext } from '@/app/providers/AlertProvider'
import { useEffect } from 'react'

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
      <Paragraph className="font-semibold text-[18px]">Whitelist</Paragraph>
      <WhitelistSearch />

      {/* TODO: We should show an empty table (not considered in the design yet) on error */}
      {isLoading && <LoadingSpinner />}
      {!isLoading && <WhitelistGrid items={builders} />}
    </div>
  )
}
