import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { usePermissionsManager } from '@/app/vault/hooks/usePermissionsManager'

import { MenuData, menuData, menuDataNotConnected, RequiredRole } from './menuData'

export function useFilteredMenuData(): MenuData[] {
  const { isConnected } = useAccount()
  const { isAdmin, isFundManager } = usePermissionsManager()

  const baseMenu = isConnected ? menuData : menuDataNotConnected

  return useMemo(() => {
    const roleMap: Record<RequiredRole, boolean> = {
      admin: isAdmin,
      fundManager: isFundManager,
    }

    return (baseMenu as readonly MenuData[]).filter(item => !item.requiredRole || roleMap[item.requiredRole])
  }, [baseMenu, isAdmin, isFundManager])
}
