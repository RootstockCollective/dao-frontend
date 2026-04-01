import { memo } from 'react'
import { useVaultHistoryTable } from './VaultHistoryTable.config'
import { MobileVaultHistoryCard } from './MobileVaultHistoryCard'
import { Header, Paragraph } from '@/components/Typography'

export const MobileVaultHistory = memo(() => {
  const { rows, totalAmount } = useVaultHistoryTable()

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col gap-2 w-full md:hidden p-8 items-center justify-center"
        data-testid="MobileVaultHistory"
      >
        <Paragraph className="text-v3-text-secondary" data-testid="NoVaultHistory">
          No vault history found
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full md:hidden" data-testid="MobileVaultHistory">
      {totalAmount !== null && (
        <div className="flex flex-col gap-1 px-4 pt-2 pb-4" data-testid="MobileVaultHistoryTotal">
          <Paragraph variant="body-s" className="text-v3-text-secondary">
            Total amount (USD)
          </Paragraph>
          <div className="flex items-baseline gap-2">
            <Header variant="h3" className="m-0" data-testid="MobileVaultHistoryTotalAmount">
              {totalAmount}
            </Header>
            <Paragraph variant="body-s" className="text-v3-text-100">
              USD
            </Paragraph>
          </div>
        </div>
      )}
      {rows.map(row => (
        <MobileVaultHistoryCard key={row.id} row={row} />
      ))}
    </div>
  )
})

MobileVaultHistory.displayName = 'MobileVaultHistory'
