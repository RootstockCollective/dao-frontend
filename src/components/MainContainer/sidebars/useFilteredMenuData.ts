import { useAccount } from 'wagmi'

import { MenuData, menuData, menuDataNotConnected } from './menuData'

/**
 * Returns the menu data based on the user's connection state.
 */
export function useFilteredMenuData(): MenuData[] {
  const { isConnected } = useAccount()
  return isConnected
    ? (menuData as readonly MenuData[]).slice()
    : (menuDataNotConnected as readonly MenuData[]).slice()
}
