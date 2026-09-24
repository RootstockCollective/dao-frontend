'use client'

import { ReactNode, useSyncExternalStore } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import { ChevronDownIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface PersistedCollapsibleProps {
  /** localStorage key that remembers whether the section is open. Unique per section. */
  storageKey: string
  /** Shown on the left of the header row, next to the Show/Hide toggle. */
  heading: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  bodyClassName?: string
  'data-testid'?: string
  toggleTestId?: string
}

/**
 * Inline script that applies the remembered open state before the first paint.
 *
 * The server cannot read localStorage, so it always renders the default state; without this,
 * a section the visitor had collapsed paints open and then snaps shut once React hydrates,
 * shifting everything below it. The script runs as soon as the parser reaches it, right after
 * the section, and flips the same attributes React will set after hydration, so there is
 * nothing left to change by the time it does. It fails silently where storage is blocked.
 *
 * Exported for tests.
 */
export const getCollapsibleStateScript = (storageKey: string, defaultOpen: boolean) => {
  // The key is a constant, but it lands inside a <script>, so keep `<` from closing the tag
  const key = JSON.stringify(storageKey).replaceAll('<', '\\u003c')

  return [
    '(function(){try{',
    `var v=localStorage.getItem(${key});`,
    `var open=v==='true'?true:v==='false'?false:${defaultOpen};`,
    `var sections=document.querySelectorAll('[data-collapsible-key='+JSON.stringify(${key})+']');`,
    'for(var i=0;i<sections.length;i++){',
    "var s=sections[i];s.setAttribute('data-open',String(open));",
    "var b=s.querySelector('[data-collapsible-body]');",
    "if(b){if(open){b.removeAttribute('hidden')}else{b.setAttribute('hidden','')}}",
    '}}catch(e){}})()',
  ].join('')
}

const subscribeToNothing = () => () => {}

/**
 * True while rendering on the server and during hydration, false for every render after it.
 * The state script only matters for server HTML: on a client-side navigation the stored value
 * is read synchronously on the first render, and React would not run a script it creates anyway.
 */
const useIsServerOrHydrating = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => false,
    () => true,
  )

/**
 * A titled section whose body can be hidden, remembering the choice in localStorage across
 * visits. The remembered state is applied before the first paint (see
 * getCollapsibleStateScript), so a collapsed section never flashes open on load.
 *
 * Visual state is driven by the section's `data-open` attribute, so the label and chevron are
 * right from the first paint too; the body uses the `hidden` attribute, which also removes it
 * from the accessibility tree while collapsed.
 */
export const PersistedCollapsible = ({
  storageKey,
  defaultOpen = true,
  heading,
  children,
  className,
  bodyClassName,
  'data-testid': dataTestId,
  toggleTestId,
}: PersistedCollapsibleProps) => {
  const [isOpen, setIsOpen] = useLocalStorageState<boolean>(storageKey, { defaultValue: defaultOpen })
  const isServerOrHydrating = useIsServerOrHydrating()

  return (
    <section
      data-testid={dataTestId}
      data-collapsible-key={storageKey}
      data-open={String(isOpen)}
      // The state script may have flipped data-open before hydration
      suppressHydrationWarning
      className={cn(
        'group/collapsible flex w-full flex-col gap-6 self-stretch rounded bg-v3-bg-accent-80 px-4 py-6 md:px-6 md:py-8',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {heading}
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-v3-text-60 hover:text-v3-text-100"
          data-testid={toggleTestId}
        >
          {/* Both labels are rendered and CSS shows the one matching data-open, so the label is
              right before hydration; aria-hidden keeps only the current one in the name */}
          <Span
            variant="body-s"
            aria-hidden={!isOpen || undefined}
            className="group-data-[open=false]/collapsible:hidden"
          >
            Hide
          </Span>
          <Span
            variant="body-s"
            aria-hidden={isOpen || undefined}
            className="group-data-[open=true]/collapsible:hidden"
          >
            Show
          </Span>
          <ChevronDownIcon
            aria-hidden
            size={20}
            className="transition-transform group-data-[open=true]/collapsible:rotate-180"
          />
        </button>
      </div>

      <div data-collapsible-body hidden={!isOpen} suppressHydrationWarning className={bodyClassName}>
        {children}
      </div>

      {isServerOrHydrating && (
        <script
          // Static string built from a constant key, see getCollapsibleStateScript
          dangerouslySetInnerHTML={{ __html: getCollapsibleStateScript(storageKey, defaultOpen) }}
          suppressHydrationWarning
        />
      )}
    </section>
  )
}
