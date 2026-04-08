import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { usePermissionsManager } from '@/shared/hooks/contracts'

import { MenuData, menuData, menuDataNotConnected, RequiredRole } from './menuData'

/**
 * Filters the menu data based on the user's roles.
 */
export function useFilteredMenuData(): MenuData[] {
  const { isConnected } = useAccount()
  const { isAdmin, isFundManager, isPauser } = usePermissionsManager()

  const baseMenu = isConnected ? menuData : menuDataNotConnected

  return useMemo(() => {
    const roleMap: Record<RequiredRole, boolean> = {
      admin: isAdmin,
      fundManager: isFundManager,
      pauser: isPauser,
    }

    return (baseMenu as readonly MenuData[]).filter(item => {
      return !item.requiredRole || item.requiredRole.some(role => roleMap[role])
    })
  }, [baseMenu, isAdmin, isFundManager, isPauser])
}
