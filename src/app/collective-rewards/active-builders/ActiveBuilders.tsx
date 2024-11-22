import { HeaderTitle } from '@/components/Typography'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { ActiveBuildersContent } from '@/app/collective-rewards/active-builders'
import { BuilderContextProvider } from '@/app/collective-rewards/user'

export const ActiveBuilders = () => {
  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <HeaderTitle>Activated Builders</HeaderTitle>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <BuilderContextProvider>
            <ActiveBuildersContent />
          </BuilderContextProvider>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
