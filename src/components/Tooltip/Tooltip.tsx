import { cn } from '@/lib/utils'
import { HTMLAttributes, PropsWithChildren } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

interface Props extends HTMLAttributes<HTMLElement> {
  text: string
  position?: 'right' | 'left' | 'top' | 'bottom'
  disabled?: boolean
}

export function Tooltip({
  className,
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
        <RadixTooltip.Content
          side={position}
          sideOffset={5}
          className={cn(
            'rounded-full bg-dark-gray px-2 py-1 text-warm-gray text-xs font-normal shadow-lg',
            className,
          )}
          {...props}
        >
          {text}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
