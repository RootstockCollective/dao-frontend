import { Button } from '@/components/ButtonNew/Button'
import { PowerIconKoto } from '@/components/Icons'

export const DisconnectButton = () => (
  <Button data-testid="ButtonDisconnect" variant="secondary-outline" className="px-2 py-1 border-bg-40">
    <div className="flex flex-row gap-1 items-center text-[14px] font-normal">
      <PowerIconKoto /> Disconnect wallet
    </div>
  </Button>
)
