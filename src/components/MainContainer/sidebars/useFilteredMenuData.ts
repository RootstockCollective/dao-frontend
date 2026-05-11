import { useAccount } from 'wagmi'

import { MenuData, menuData, menuDataNotConnected } from './menuData'

/**
 * Returns the menu items for the current connection state.
 */
export function useFilteredMenuData(): MenuData[] {
  const { isConnected } = useAccount()
  return isConnected
    ? (menuData as readonly MenuData[]).slice()
    : (menuDataNotConnected as readonly MenuData[]).slice()
}
