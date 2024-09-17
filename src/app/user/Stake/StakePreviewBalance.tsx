import { StakePreviewBalanceProps } from '@/app/user/Stake/types'
import { Span } from '@/components/Typography'
import { toFixed } from '@/lib/utils'
import Image from 'next/image'

export const StakePreviewBalance = ({
  topLeftText,
  amount,
  amountConvertedToCurrency,
  balance,
  tokenSymbol,
}: StakePreviewBalanceProps) => (
  <div className="flex justify-between p-[16px]">
    <div>
      <Span size="small">{topLeftText}</Span>
      <div className="flex mt-[8px] gap-3 items-center">
        <Span className="font-bold text-nowrap">
          {amount} {tokenSymbol}
        </Span>
        <Span variant="light" size="small" className="text-nowrap pt-1">
          = {amountConvertedToCurrency}
        </Span>
      </div>
    </div>
    <div>
      {/* Balance and Token */}
      <Span size="small" variant="light">
        Balance: {toFixed(balance)}
      </Span>
      <div className="text-right mt-[8px] flex justify-end items-center">
        {/* Maybe in the future make it dynamic - for now it's ok */}
        <Image
          src="/images/rif-logo.png"
          alt="stRIF Logo"
          width={0}
          height={0}
          className="mr-[8px] w-[16px] h-[16px]"
        />
        <strong>{tokenSymbol}</strong>
      </div>
    </div>
  </div>
)
