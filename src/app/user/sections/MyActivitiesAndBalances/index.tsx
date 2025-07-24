import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { MyBacking } from '../MyActivities'
import { MyBalances } from '../Balances'

const Separator = () => <hr className="w-full bg-bg-60 border-none h-px my-10" />

export const MyActivitiesAndBalances = () => {
  const isUserBuilder = true // @TODO
  const sectionTitle = isUserBuilder ? 'MY ACTIVITY & BALANCES' : 'MY BALANCES'

  return (
    <SectionContainer title={sectionTitle} headerVariant="h3">
      {isUserBuilder && (
        <>
          <MyBacking />
          <Separator />
        </>
      )}
      <MyBalances />
    </SectionContainer>
  )
}
