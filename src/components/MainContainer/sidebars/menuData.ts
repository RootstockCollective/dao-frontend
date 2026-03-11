import type { ClassValue } from 'clsx'

import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

export type RequiredRole = 'admin' | 'fundManager'

export interface MenuData {
  text: string
  href: string
  buttonProps: {
    id: string
    name: string
    className?: ClassValue
  }
  type?: 'link' | 'category'
  iconUrl?: string
  requiredRole?: RequiredRole
}

function getBetaToolsSection(): MenuData[] {
  const vaultOn = getEnvFlag('vault')
  const btcVaultOn = getEnvFlag('btc_vault')
  const vaultManagementOn = getEnvFlag('vault_management')
  if (!vaultOn && !btcVaultOn && !vaultManagementOn) return []
  const items: MenuData[] = []
  items.push({
    href: '-',
    text: 'BETA TOOLS',
    buttonProps: { id: 'Button_Beta_Tools', name: 'beta-tools', className: 'mt-5' },
    type: 'category',
  })
  if (vaultOn) {
    items.push({
      href: 'vault',
      text: 'USD Vault Sandbox',
      buttonProps: { id: 'Button_Vault', name: 'vault' },
      iconUrl: '/images/sidemenukoto/Holdings.svg',
    })
  }
  if (vaultManagementOn) {
    items.push(
      {
        href: 'fund-manager',
        text: 'Fund Manager',
        buttonProps: { id: 'Button_Fund_Manager', name: 'fund-manager' },
        iconUrl: '/images/sidemenukoto/FundManager.svg',
        requiredRole: 'fundManager',
      },
      {
        href: 'admin',
        text: 'Admin',
        buttonProps: { id: 'Button_Admin', name: 'admin' },
        iconUrl: '/images/sidemenukoto/Admin.svg',
        requiredRole: 'admin',
      },
    )
  }
  if (btcVaultOn) {
    items.push({
      href: 'btc-vault',
      text: 'BTC Vault Sandbox',
      buttonProps: { id: 'Button_Btc_Vault', name: 'btc-vault' },
      iconUrl: '/images/sidemenukoto/Holdings.svg',
    })
  }
  return items
}

function getBetaToolsSectionNotConnected(): MenuData[] {
  const vaultOn = getEnvFlag('vault')
  const btcVaultOn = getEnvFlag('btc_vault')
  const rbtcVaultOn = getEnvFlag('vault_management')
  if (!vaultOn && !btcVaultOn && !rbtcVaultOn) return []
  const items: MenuData[] = []
  items.push({
    href: '-',
    text: 'BETA TOOLS',
    buttonProps: { id: 'Button_Beta_Tools_Not_Connected', name: 'beta-tools', className: 'mt-5' },
    type: 'category',
  })
  if (vaultOn) {
    items.push({
      href: 'vault',
      text: 'USD Vault Sandbox',
      buttonProps: { id: 'Button_Vault_Not_Connected', name: 'vault' },
      iconUrl: '/images/sidemenukoto/Holdings.svg',
    })
  }
  if (btcVaultOn) {
    items.push({
      href: 'btc-vault',
      text: 'BTC Vault Sandbox',
      buttonProps: { id: 'Button_Btc_Vault_Not_Connected', name: 'btc-vault' },
      iconUrl: '/images/sidemenukoto/Holdings.svg',
    })
  }
  return items
}

export const menuData = [
  {
    href: '',
    text: 'My Collective',
    buttonProps: { id: 'Button_User', name: 'user' },
    type: 'category',
  },
  {
    href: '',
    text: 'Holdings',
    buttonProps: { id: 'Button_Holdings', name: 'holdings' },
    iconUrl: '/images/sidemenukoto/Holdings.svg',
  },
  {
    href: 'my-rewards',
    text: 'Rewards',
    buttonProps: { id: 'Button_Rewards', name: 'rewards' },
    iconUrl: '/images/sidemenukoto/My-Rewards.svg',
  },
  {
    href: 'backing',
    text: 'Backing',
    buttonProps: { id: 'Button_Backing', name: 'backing' },
    iconUrl: '/images/sidemenukoto/Backing.svg',
  },
  {
    href: 'delegate',
    text: 'Delegation',
    buttonProps: { id: 'Button_Delegate', name: 'delegate' },
    iconUrl: '/images/sidemenukoto/Delegation.svg',
  },
  {
    href: '-',
    text: 'The Collective',
    buttonProps: { id: 'Button_The_Collective', name: 'the-collective', className: 'mt-5' },
    type: 'category',
  },
  {
    href: 'treasury',
    text: 'Treasury',
    buttonProps: { id: 'Button_Treasury', name: 'treasury' },
    iconUrl: '/images/sidemenukoto/Treasury.svg',
  },
  {
    href: 'proposals',
    text: 'Proposals',
    buttonProps: { id: 'Button_Proposals', name: 'proposals' },
    iconUrl: '/images/sidemenukoto/Proposals.svg',
  },
  {
    href: 'communities',
    text: 'Communities',
    buttonProps: { id: 'Button_Communities', name: 'communities' },
    iconUrl: '/images/sidemenukoto/Communities.svg',
  },
  {
    href: 'collective-rewards',
    text: 'Collective Rewards',
    buttonProps: { id: 'Button_CollectiveRewards', name: 'collective-rewards' },
    iconUrl: '/images/sidemenukoto/Collective-Rewards.svg',
  },
  {
    href: 'builders',
    text: 'Builders',
    buttonProps: { id: 'Button_Builders', name: 'builders' },
    iconUrl: '/images/sidemenukoto/Builders.svg',
  },
  ...getBetaToolsSection(),
] as const satisfies MenuData[]

export const menuDataNotConnected = [
  {
    href: '',
    text: 'My Collective',
    buttonProps: { id: 'Button_User', name: 'user' },
    type: 'category',
  },
  {
    href: '',
    text: 'Holdings',
    buttonProps: { id: 'Button_Holdings_Not_Connected', name: 'holdings' },
    iconUrl: '/images/sidemenukoto/Holdings.svg',
  },
  {
    href: 'backing',
    text: 'Backing',
    buttonProps: { id: 'Button_Backing', name: 'backing' },
    iconUrl: '/images/sidemenukoto/Backing.svg',
  },
  {
    href: 'delegate',
    text: 'Delegation',
    buttonProps: { id: 'Button_Delegate', name: 'delegate' },
    iconUrl: '/images/sidemenukoto/Delegation.svg',
  },
  {
    href: '',
    text: 'The Collective',
    buttonProps: { id: 'Button_The_Collective', name: 'the-collective' },
    type: 'category',
  },
  {
    href: 'treasury',
    text: 'Treasury',
    buttonProps: { id: 'Button_Treasury', name: 'treasury' },
    iconUrl: '/images/sidemenukoto/Treasury.svg',
  },
  {
    href: 'proposals',
    text: 'Proposals',
    buttonProps: { id: 'Button_Proposals', name: 'proposals' },
    iconUrl: '/images/sidemenukoto/Proposals.svg',
  },
  {
    href: 'communities',
    text: 'Communities',
    buttonProps: { id: 'Button_Communities', name: 'communities' },
    iconUrl: '/images/sidemenukoto/Communities.svg',
  },
  {
    href: 'collective-rewards',
    text: 'Collective Rewards',
    buttonProps: { id: 'Button_CollectiveRewards', name: 'collective-rewards' },
    iconUrl: '/images/sidemenukoto/Collective-Rewards.svg',
  },
  {
    href: 'builders',
    text: 'Builders',
    buttonProps: { id: 'Button_Builders', name: 'builders' },
    iconUrl: '/images/sidemenukoto/Builders.svg',
  },
  ...getBetaToolsSectionNotConnected(),
] as const satisfies MenuData[]
