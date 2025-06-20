import * as SelectPrimitive from '@radix-ui/react-select'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from '@/components/Icons'

// Composable Dropdown components based on Radix Select primitives.
// Usage example:
// <Dropdown value={...} onValueChange={...}>
//   <DropdownTrigger>...</DropdownTrigger>
//   <DropdownContent>
//     <DropdownItem value="1">One</DropdownItem>
//   </DropdownContent>
// </Dropdown>

const Dropdown = SelectPrimitive.Root

const DropdownTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group w-full px-4 py-2 font-rootstock-sans shadow focus:outline-none bg-v3-bg-accent-60 rounded flex flex-row items-center justify-between text-white gap-4 font-normal',
      className,
    )}
    data-testid="dropdown-trigger"
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon
        size={16}
        className="flex-shrink-0 transition-transform duration-100 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
DropdownTrigger.displayName = SelectPrimitive.Trigger.displayName

const DropdownContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn('z-50 font-rootstock-sans rounded-b-md overflow-hidden bg-v3-bg-accent-60', className)}
      position={position}
      sideOffset={8}
      data-testid="dropdown-content"
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn('p-1', position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]')}
        data-testid="dropdown-option-container"
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
DropdownContent.displayName = SelectPrimitive.Content.displayName

const DropdownItem = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'px-4 py-2 cursor-pointer outline-none bg-v3-bg-accent-60 text-v3-text-100 hover:bg-v3-bg-accent-20 focus:bg-v3-bg-accent-20 data-[state=checked]:text-v3-bg-accent-100 data-[state=checked]:bg-v3-text-80',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
DropdownItem.displayName = SelectPrimitive.Item.displayName

const DropdownValue = SelectPrimitive.Value

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownValue }
