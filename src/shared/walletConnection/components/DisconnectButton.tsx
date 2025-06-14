import { Button } from '@/components/Button'
import { PowerIconKoto } from '@/components/Icons'

export const DisconnectButton = () => (
  <Button
    data-testid="ButtonDisconnect"
    variant="secondary-new"
    startIcon={<PowerIconKoto />}
    startIconClasses="left-[-25px] top-[2.5px]"
  >
    Disconnect Wallet
  </Button>
)
