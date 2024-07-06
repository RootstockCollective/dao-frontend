import { Header, Label, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { LuBadgeCheck } from 'react-icons/lu'
import { goToExplorerWithTxHash } from '@/lib/utils'
import { useMemo } from 'react'
import moment from 'moment'

interface Props {
  onReturnToBalances: () => void
  hash: string
  amountReceived: string
  symbol: string
  amountReceivedCurrency: string
}

// TODO define RSK explorer testnet
export const StakeStatus = ({
  onReturnToBalances,
  hash,
  amountReceived,
  amountReceivedCurrency,
  symbol,
}: Props) => {
  const onViewOnExplorer = () => goToExplorerWithTxHash(hash)
  const date = useMemo(() => moment().format('YYYY-MM-DD h:mm A'), [])
  return (
    <div className="px-[50px] py-[20px] flex justify-center flex-col">
      <div className="flex justify-center mt-[63px]">
        <div
          style={{
            boxShadow: '0px 0px 16.4px 0px rgba(123,87,252,0.68)',
            padding: 17,
            borderRadius: '30%',
            backgroundColor: 'white',
            width: 80,
          }}
        >
          <LuBadgeCheck size={48} color="#665EF6" />
        </div>
      </div>
      <Header className="mt-[62px] text-center">Stake successful!</Header> {/*@TODO get stake status here?*/}
      <Paragraph className="text-center" variant="light">
        Congratulations! Real-Time APR rewards will start <br />
        accumulating in your stRIF balance every minute!
      </Paragraph>
      {/* Preview box */}
      <div className="flex flex-col mt-[54px]">
        <div className="flex flex-row justify-between mb-[24px]">
          <Paragraph variant="light">Amount</Paragraph>
          <div>
            <Paragraph variant="light">
              {amountReceived} {symbol}
            </Paragraph>
            <Label variant="light">= {amountReceivedCurrency}</Label>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <Paragraph variant="light">Date</Paragraph>
          <Paragraph variant="light">{date}</Paragraph>
        </div>
      </div>
      {/* Stake Actions */}
      <div className="flex justify-center pt-10 gap-4">
        <Button variant="secondary" onClick={onViewOnExplorer}>
          View on explorer
        </Button>
        <Button onClick={onReturnToBalances}>Return to balances</Button>
      </div>
    </div>
  )
}
