import { FC, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * Layout container for a row of up to 4 metric cards.
 * Cards use flex-1 so they share width equally; an invisible spacer
 * fills the remaining slot when a row has fewer than 4 items.
 */
export const RbtcVaultMetricsRow: FC<Props> = ({ children }) => {
  return <div className="flex gap-6 w-full">{children}</div>
}
