import { HeaderTitle, Paragraph } from '@/components/Typography'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared'

export const Header = () => {
  return (
    <>
      <HeaderTitle>Confirm strif allocation for the selected builders</HeaderTitle>
      <Paragraph className="font-normal leading-6 text-[rgba(255,255,255,0.6)]">
        Support innovative Builders by allocating your stRIF to those you align with. Your allocations shape
        their rewards, and you retain full ownership and access to your stRIF while earning a portion of their
        rewards. For more information check the <CRWhitepaperLink />.
      </Paragraph>
    </>
  )
}
