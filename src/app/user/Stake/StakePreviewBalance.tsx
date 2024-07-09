import { Span } from '@/components/Typography'
import { StakePreviewBalanceProps } from '@/app/user/Stake/types'

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
          {amount.substring(0, 10)} {tokenSymbol}
        </Span>
        <Span variant="light" size="small" className="text-nowrap">
          = {amountConvertedToCurrency.substring(0, 20)}
        </Span>
      </div>
    </div>
    <div>
      {/* Balance and Token */}
      <Span size="small" variant="light">
        Balance: {balance.substring(0, 10)}
      </Span>
      <div className="text-right mt-[8px]">{/* @TODO ICON {tokenSymbol} */}</div>
    </div>
  </div>
)
