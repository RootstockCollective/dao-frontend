import { TokenImage } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/TypographyNew'
import Image from 'next/image'
import { formatEther } from 'viem'

interface Props {
  backerTotalAllocation: bigint
  stRifBalance: string
}

export const AllocationWarning = ({ backerTotalAllocation, stRifBalance }: Props) => (
  <>
    <div className="flex items-center gap-2 mb-2 mt-10">
      <Image src="/images/info-icon.svg" alt="Info" width={40} height={40} />
      <Paragraph>
        You have{' '}
        <Span variant="body" bold>
          {formatEther(backerTotalAllocation)} stRIF
        </Span>{' '}
        in votes allocated in the Collective Rewards. You must de-allocate it, before unstaking.
      </Paragraph>
    </div>
    <div className="flex items-center gap-2 mb-6 ml-12">
      <TokenImage symbol="stRIF" size={16} />
      <Span variant="body-s" className="text-text-60">
        stRIF balance: {stRifBalance}
      </Span>
    </div>
  </>
)
