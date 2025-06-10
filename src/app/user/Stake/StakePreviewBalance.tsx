import { StakePreviewBalanceProps } from '@/app/user/Stake/types'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'

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
        Balance: {formatNumberWithCommas(Big(balance).toFixedNoTrailing(8))}
      </Span>
      <div className="text-right mt-[8px] flex justify-end items-center">
        <TokenImage symbol={tokenSymbol as string} className="mr-[8px]" />
        <strong>{tokenSymbol}</strong>
      </div>
    </div>
  </div>
)
