import { BuilderHeader } from '@/app/backing/components/BuilderHeader/BuilderHeader'
import { TokenImage } from '@/components/TokenImage'
import { Header, Span } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { formatAmount } from '@/lib/utils'
import { Address, formatEther } from 'viem'
import { EXPLORER_URL } from '@/lib/constants'

interface HolderCardProps {
  amount: string
  address: string
  rns?: string
  price?: number
}

export const HolderCard = ({ address, rns, amount, price }: HolderCardProps) => (
  <div className="flex flex-col max-w-[256px] max-h-[284px] py-6 px-4 bg-bg-60 items-center justify-center">
    <BuilderHeader
      name={rns}
      address={address as Address}
      className="mt-2"
      builderPageLink={`${EXPLORER_URL}/address/${address}`}
    />
    <div className="flex flex-col border-0.5 border-[1px] border-bg-40 p-3 text-left mt-5 w-full">
      <div className="flex items-center">
        <Header variant="h2">{formatAmount(amount)}</Header>
        <TokenImage className="ml-1" symbol="RIF" size={16} />
        <Span variant="tag-s" className="ml-1">
          stRIF
        </Span>
      </div>
      <Span variant="tag-s" className="text-bg-0 mt-2">
        {!price
          ? 0
          : Big(formatEther(BigInt(amount)))
              .mul(price)
              .round(2)
              .toString()}{' '}
        USD
      </Span>
    </div>
  </div>
)
