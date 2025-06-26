import { SearchIconKoto } from '@/components/Icons'
import { cn } from '@/lib/utils'

interface SearchButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  disabled?: boolean
  isFiltering?: boolean
}

export function SearchButton({
  isOpen,
  setIsOpen,
  className,
  disabled = false,
  isFiltering = false,
  ...props
}: SearchButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      className={cn({ 'opacity-50': disabled }, className)}
      {...props}
    >
      <SearchIconKoto className="scale-90" color={isFiltering ? 'var(--color-primary)' : undefined} />
    </button>
  )
}
