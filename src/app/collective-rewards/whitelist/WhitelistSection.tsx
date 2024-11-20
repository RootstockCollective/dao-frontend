import { HeaderTitle } from '@/components/Typography'
import { WhitelistGrid, WhitelistSearch } from './components'
import { useWhitelistContext } from './context'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const WhitelistSection = () => {
  const { builders, isLoading, error: whitelistError } = useWhitelistContext()
  useHandleErrors({ error: whitelistError, title: 'Error loading proposals state' })

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
