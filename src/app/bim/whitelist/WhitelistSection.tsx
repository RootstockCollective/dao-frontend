import { WhitelistGrid } from '@/app/bim/whitelist/WhitelistGrid'
import { WhitelistSearch } from '@/app/bim/whitelist/WhitelistSearch'
import { Paragraph } from '@/components/Typography'
import { useWhitelistContext } from '@/app/bim/whitelist/WhitelistContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const WhitelistSection = () => {
  const { builders, isLoading, error } = useWhitelistContext()

  return (
    <div>
      <Paragraph className="font-semibold text-[18px]">Whitelist</Paragraph>
      <WhitelistSearch />

      {/* TODO: We should raise a notification and show an empty table (not considered in the design yet) */}
      {error && <div>Error while loading data, please try again.</div>}
      {isLoading && <LoadingSpinner />}
      {!isLoading && <WhitelistGrid items={builders} />}
    </div>
  )
}
