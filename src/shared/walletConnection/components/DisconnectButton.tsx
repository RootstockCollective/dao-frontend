import { Button } from '@/components/ButtonNew/Button'
import { PowerIconKoto } from '@/components/Icons'

interface DisconnectButtonProps {
  onClick: () => void
}

export const DisconnectButton = ({ onClick }: DisconnectButtonProps) => (
  <Button
    data-testid="ButtonDisconnect"
    variant="secondary-outline"
    className="px-2 py-1 border-bg-40"
    textClassName="font-normal"
    onClick={onClick}
  >
    <div className="flex flex-row gap-1 items-center text-[14px]">
      <PowerIconKoto /> Disconnect wallet
    </div>
  </Button>
)
