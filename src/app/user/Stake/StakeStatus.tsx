import { Header, Label, Span } from '@/components/Typography'
import { Button } from '@/components/Button'
import { goToExplorerWithTxHash } from '@/lib/utils/utils'
import { useMemo } from 'react'
import moment from 'moment'
import { ActionBeingExecuted, textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'

interface Props {
  onReturnToBalances: () => void
  hash: string
  amountReceived: string
  symbol: string
  amountReceivedCurrency: string
  actionName: ActionBeingExecuted
}

// TODO define RSK explorer testnet
export const StakeStatus = ({
  onReturnToBalances,
  hash,
  amountReceived,
  amountReceivedCurrency,
  symbol,
  actionName,
}: Props) => {
  const onViewOnExplorer = () => goToExplorerWithTxHash(hash)
  const date = useMemo(() => moment().format('YYYY-MM-DD h:mm A'), [])
  return (
    <div className="px-[50px] py-[20px] flex justify-center flex-col">
      <Header className="mt-[62px] text-center font-normal" fontFamily="kk-topo">
        {textsDependingOnAction[actionName].inProcess}
      </Header>
      <Span className="text-center">{textsDependingOnAction[actionName].description}</Span>
      {/* Preview box */}
      <div className="flex flex-col mt-[54px] px-6">
        <div className="flex flex-row justify-between mb-[24px]">
          <Span>Amount</Span>
          <div>
            <Span>
              {amountReceived} {symbol}
            </Span>
            <br />
            <Label variant="light" className="text-[14px]">
              = {amountReceivedCurrency}
            </Label>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <Span>Date</Span>
          <Span>{date}</Span>
        </div>
      </div>
      {/* Stake Actions */}
      <div className="flex justify-center pt-10 gap-4">
        <Button
          variant="secondary"
          onClick={onViewOnExplorer}
          buttonProps={{ 'data-testid': 'GoToExplorer' }}
        >
          View on explorer
        </Button>
        <Button onClick={onReturnToBalances} buttonProps={{ 'data-testid': 'ReturnToBalances' }}>
          Go to balances
        </Button>
      </div>
    </div>
  )
}
