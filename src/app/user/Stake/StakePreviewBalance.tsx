import { StakePreviewBalanceProps } from '@/app/user/Stake/types'
import { Span } from '@/components/Typography'

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
        Balance: {balance}
      </Span>
      <div className="text-right mt-[8px]">{/* @TODO ICON {tokenSymbol} */}</div>
    </div>
  </div>
)
