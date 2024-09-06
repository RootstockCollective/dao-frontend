import { useFetchWhitelistedBuilders } from '@/app/bim/whitelist/hooks/useFetchWhitelistedBuilders'
import { WhitelistGrid } from '@/app/bim/whitelist/WhitelistGrid'
import { WhitelistSearch } from '@/app/bim/whitelist/WhitelistSearch'
import { Paragraph } from '@/components/Typography'

export const WhitelistSection = () => {
  const { data, isLoading, error } = useFetchWhitelistedBuilders()

  return (
    <div>
      <Paragraph className="font-semibold text-[18px] mb-[17px]">Whitelist</Paragraph>
      <WhitelistSearch />

      {/* TODO: We should raise a notification and show an empty table (not considered in the design yet) */}
      {error && <div>Error while loading data, please try again.</div>}
      {isLoading && <div>Loading...</div>}
      {!isLoading && <WhitelistGrid items={data?.data || []} />}
    </div>
  )
}
