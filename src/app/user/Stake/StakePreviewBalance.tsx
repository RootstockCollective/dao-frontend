import { Label, Paragraph } from '@/components/Typography'
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
      <Paragraph variant="light">{topLeftText}</Paragraph>
      <div className="flex mt-[8px] gap-4 flex-col">
        <Paragraph>
          {amount} {tokenSymbol}
        </Paragraph>
        <Label className="text-nowrap">= {amountConvertedToCurrency}</Label>
      </div>
    </div>
    <div>
      {/* Balance and Token */}
      <Label className="text-nowrap">Balance: {balance}</Label>
      <div className="text-right mt-[8px]">{/* @TODO ICON {tokenSymbol} */}</div>
    </div>
  </div>
)
