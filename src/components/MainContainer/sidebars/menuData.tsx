import { ClassValue } from 'clsx'

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
  },
  {
    href: '-',
    text: 'The Collective',
    buttonProps: { id: 'Button_The_Collective', name: 'the-collective', className: 'mt-5' },
    type: 'category',
  },
  {
    href: 'dummy-home',
    text: 'Home',
    buttonProps: { id: 'Button_Home', name: 'home' },
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
    buttonProps: { id: 'Button_User', name: 'user' },
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
] as const satisfies MenuData[]
