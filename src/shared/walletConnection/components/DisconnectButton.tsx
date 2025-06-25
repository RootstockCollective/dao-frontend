import { Button } from '@/components/ButtonNew/Button'
import { PowerIconKoto } from '@/components/Icons'

interface Props {
  onClick: () => void
}

export const DisconnectButton = ({ onClick }: Props) => (
  <Button
    data-testid="ButtonDisconnect"
    variant="secondary-outline"
    className="px-2 py-1 border-bg-40"
    onClick={onClick}
  >
    <div className="flex flex-row gap-1 items-center text-[14px]">
      <PowerIconKoto /> Disconnect wallet
    </div>
  </Button>
)
