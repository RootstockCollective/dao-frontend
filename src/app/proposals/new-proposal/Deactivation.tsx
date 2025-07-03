import { Paragraph } from '@/components/TypographyNew'
import { CardButton } from './CardButton'
import Link from 'next/link'

export function Deactivation() {
  return (
    <div className="w-full max-w-[568px] lg:max-w-[1144px] p-6 mx-auto flex flex-col gap-4 bg-bg-80 rounded-sm">
      <Paragraph className="max-w-[544px]">
        A Builder needs to leave? Propose the removal of a Builder from the Rewards program if they no longer
        meet the Collective&apos;s criteria.
      </Paragraph>
      <div className="w-fit">
        <Link href="/proposals/create?contract=BuilderRegistryAbi&action=dewhitelistBuilder">
          <CardButton className="border border-bg-0 text-text-100">Propose deactivation</CardButton>
        </Link>
      </div>
    </div>
  )
}
