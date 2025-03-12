import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Paragraph, Span } from '@/components/Typography'
import { ModalReturn } from '@/shared/hooks/useModal'
import { useAccount } from 'wagmi'

interface Props {
  unstakeModal: ModalReturn
}

export const UnStakeRIFCell = ({ unstakeModal }: Props) => {
  const { isConnected } = useAccount()
  const { balances } = useBalancesContext()
  const { balance } = balances['stRIF']
  const hasEnoughBalance = Number(balance) > 0

  if (isConnected) {
    return (
      <Button
        variant="outlined"
        onClick={unstakeModal.openModal}
        disabled={!hasEnoughBalance}
        buttonProps={{ style: { width: '93px' } }}
        data-testid="UnstakeRIF"
      >
        Unstake
      </Button>
    )
  }

  return (
    <Popover content={<PopoverContent />} position="left-top" contentSubContainerClassName="rounded-none p-3">
      <Button variant="secondary" buttonProps={{ style: { width: '93px' } }} data-testid="UnstakeRIF">
        Unstake
      </Button>
    </Popover>
  )
}

const PopoverContent = () => {
  const Bold = ({ children }: any) => <Span className="text-primary text-[14px]">{children}</Span>
  return (
    <>
      <Paragraph size="small" className="text-white" data-testid="UnstakingPopover">
        Unstaking lets you <Bold>convert your stRIF back to RIF</Bold>, giving you full control over your
        tokens again.
      </Paragraph>
      <Paragraph size="small" className="text-white mt-3">
        <ul>
          <li>❌ Stop Participating</li>
          <li>❌ Withdraw Your Funds</li>
          <li>❌ End Rewards</li>
        </ul>
      </Paragraph>
    </>
  )
}
