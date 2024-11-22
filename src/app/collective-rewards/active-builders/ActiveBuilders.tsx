import { HeaderTitle } from '@/components/Typography'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { ActiveBuildersContent } from '@/app/collective-rewards/active-builders'

export const ActiveBuilders = () => {
  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <HeaderTitle>Activated Builders</HeaderTitle>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ActiveBuildersContent />
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
