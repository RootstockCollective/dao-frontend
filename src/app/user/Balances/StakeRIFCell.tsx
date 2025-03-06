import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { Paragraph, Span } from '@/components/Typography'
import { ConnectWorkflow } from '@/lib/walletConnection'
import { ConnectButtonComponentProps } from '@/lib/walletConnection/types'
import { ModalReturn } from '@/shared/hooks/useModal'
import { useAccount } from 'wagmi'

interface Props {
  stakeModal: ModalReturn
}

export const StakeRIFCell = ({ stakeModal }: Props) => {
  const { isConnected } = useAccount()
  const { balances } = useBalancesContext()
  const { balance } = balances['RIF']
  const hasEnoughBalance = Number(balance) > 0

  if (isConnected) {
    return (
      <Button
        onClick={hasEnoughBalance ? stakeModal.openModal : undefined}
        disabled={!hasEnoughBalance}
        buttonProps={{ style: { width: '93px' } }}
        data-testid="StakeRIF"
      >
        Stake
      </Button>
    )
  }

  return (
    <Popover content={<PopoverContent />} position="left-top" contentSubContainerClassName="rounded-none p-3">
      <Button variant="white" buttonProps={{ style: { width: '93px' } }} data-testid="StakeRIF">
        Stake
      </Button>
    </Popover>
  )
}

const PopoverContent = () => {
  const Bold = ({ children }: any) => <Span className="text-primary text-[14px]">{children}</Span>
  const ConnectButton = ({ onClick }: ConnectButtonComponentProps) => (
    <Button variant="secondary" onClick={onClick}>
      Connect wallet
    </Button>
  )
  return (
    <>
      <Paragraph size="small" className="text-white" data-testid="StakingPopover">
        <Bold>Staking RIF</Bold> is how you actively participate in the DAO. When you stake <Bold>RIF</Bold>,
        it becomes <Bold>stRIF</Bold>, which give you power to:
      </Paragraph>
      <Paragraph size="small" className="text-white mt-4">
        <ul>
          <li>✅ Vote on proposals</li>
          <li>✅ Allocate Funds</li>
          <li>✅ Earn Rewards</li>
        </ul>
      </Paragraph>
      <div className="mt-4">
        <ConnectWorkflow ConnectComponent={ConnectButton}></ConnectWorkflow>
      </div>
    </>
  )
}
