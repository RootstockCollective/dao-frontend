import { HTMLAttributes, ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

interface Props extends HTMLAttributes<HTMLElement> {
  text: ReactNode
  position?: RadixTooltip.TooltipContentProps['side']
  disabled?: boolean
}

export function Tooltip({
  className = 'rounded-full bg-dark-gray px-2 py-1 text-warm-gray text-xs font-normal shadow-lg',
  children,
  text,
  position = 'right',
  disabled = false,
  ...props
}: Props) {
  if (disabled) {
    return <>{children}</>
  }
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content side={position} sideOffset={5} className={className} {...props}>
          {text}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
