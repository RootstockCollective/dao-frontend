import { cn } from '@/lib/utils'
import { GridIcon, ListIcon } from '@/components/Icons'

export type ViewState = 'images' | 'table'

interface ViewIconHandlerProps {
  view: ViewState
  onChangeView: (view: ViewState) => void
}

export const ViewIconHandler = ({ view, onChangeView }: ViewIconHandlerProps) => {
  const color = (isActive: boolean) => (isActive ? 'var(--color-text-100)' : 'var(--color-text-40)')

  return (
    <div
      className="rounded-full h-10 w-20 border-4 border-bg-100 overflow-hidden flex cursor-pointer"
      role="tablist"
      aria-label="View mode selector"
    >
      <div
        className={cn(
          'pr-1 flex-1 flex items-center justify-end',
          view === 'images' ? 'bg-bg-60 text-red-500' : 'bg-bg-100',
        )}
        onClick={() => onChangeView('images')}
        role="tab"
        aria-selected={view === 'images'}
        aria-label="Grid view"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChangeView('images')
          }
        }}
      >
        <GridIcon color={color(view === 'images')} />
      </div>
      <div
        className={cn(
          'pl-1 flex-1 flex items-center justify-start',
          view === 'table' ? 'bg-bg-60' : 'bg-bg-100',
        )}
        onClick={() => onChangeView('table')}
        role="tab"
        aria-selected={view === 'table'}
        aria-label="Table view"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChangeView('table')
          }
        }}
      >
        <ListIcon color={color(view === 'table')} />
      </div>
    </div>
  )
}
