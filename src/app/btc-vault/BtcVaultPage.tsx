'use client'

export const BtcVaultPage = () => {
  return (
    <div
      data-testid="btc-vault-page"
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <div className="flex flex-col w-full items-start gap-6">
        {/* Vault Metrics Zone – F3 */}
        <div data-testid="btc-vault-metrics" />
        {/* Dashboard Zone – F4 */}
        <div data-testid="btc-vault-dashboard" />
        {/* Actions Zone – F5/F6 */}
        <div data-testid="btc-vault-actions" />
        {/* Request Queue Zone – F9 */}
        <div data-testid="btc-vault-queue" />
        {/* History Zone – F10 */}
        <div data-testid="btc-vault-history" />
      </div>
    </div>
  )
}
