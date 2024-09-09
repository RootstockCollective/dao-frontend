import { Button } from '@/components/Button'
import { useFetchWhitelistedBuilders } from '@/app/bim/whitelist/hooks/useFetchWhitelistedBuilders'
import { Badge } from '@/components/Badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface BecomeABuilderButtonProps {
  address: string | undefined
}

const handleBecomeABuilder = () => {
  // TODO: open modal
}

// TODO: check the height and width of the badge
const KYCUnderReviewComponent = <Badge status="KYC Under Review" bgColor="bg-[#808080]" />
const KYCApprovedComponent = (
  <Button variant="secondary-full" onClick={handleBecomeABuilder}>
    Create whitelist proposal
  </Button>
)
const InProgressComponent = <Badge status="Waiting for approval" bgColor="bg-[#637381]" />
const WhitelistedComponent = <Badge status="Whitelisted" bgColor="bg-[#22AD5C]" />
const NotFoundComponent = <Button onClick={handleBecomeABuilder}>Become a builder</Button>

export const BecomeABuilderButton = ({ address }: BecomeABuilderButtonProps) => {
  const { data, isLoading, error } = useFetchWhitelistedBuilders({ builderName: '', status: 'all' })

  const builder = data.find(builder => builder.address.toLowerCase() === address?.toLowerCase())
  //TODO: pending to check the colors and if this badge colors are the same from the whitelist section
  const component = {
    'KYC Under Review': KYCUnderReviewComponent,
    'KYC Approved': KYCApprovedComponent,
    'In progress': InProgressComponent,
    Whitelisted: WhitelistedComponent,
    'Not found': NotFoundComponent,
  }[builder?.status ?? 'Not found']

  return (
    <>
      {error && <div>Error while loading data, please try again.</div>}
      {isLoading && <LoadingSpinner />}
      {!isLoading && component}
    </>
  )
}
