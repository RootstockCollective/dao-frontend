import { HTMLAttributes } from 'react'
import { HeaderTitle, Typography } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { ArrowLink } from './arrow-link'

export function DeactivationFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className, 'flex flex-col')} {...props}>
      <HeaderTitle className="text-[14px] uppercase leading-none">A builder needs to leave ?</HeaderTitle>
      <ArrowLink href="/proposals/create?contract=BuilderRegistryAbi&action=dewhitelistBuilder">
        <Typography className="inline text-sm font-[600]" data-testid="ProposeBuilderDeactivation">
          Propose a builder Deactivation
        </Typography>
      </ArrowLink>
    </div>
  )
}
