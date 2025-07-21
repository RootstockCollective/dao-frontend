import { ClassValue } from 'clsx'

interface MenuData {
  text: string
  href: string
  buttonProps: {
    id: string
    name: string
    className?: ClassValue
  }
  type?: 'link' | 'category'
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
  },
  {
    href: 'backing',
    text: 'Backing',
    buttonProps: { id: 'Button_Backing', name: 'backing' },
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
    href: 'home',
    text: 'Home',
    buttonProps: { id: 'Button_Home', name: 'home' },
  },
  {
    href: 'treasury',
    text: 'Treasury',
    buttonProps: { id: 'Button_Treasury', name: 'treasury' },
  },
  {
    href: 'proposals',
    text: 'Proposals',
    buttonProps: { id: 'Button_Proposals', name: 'proposals' },
  },
  {
    href: 'communities',
    text: 'Communities',
    buttonProps: { id: 'Button_Communities', name: 'communities' },
  },
  {
    href: 'collective-rewards',
    text: 'Collective Rewards',
    buttonProps: { id: 'Button_CollectiveRewards', name: 'collective-rewards' },
  },
  {
    href: 'builders',
    text: 'Builders',
    buttonProps: { id: 'Button_Builders', name: 'builders' },
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
  },
  {
    href: 'proposals',
    text: 'Proposals',
    buttonProps: { id: 'Button_Proposals', name: 'proposals' },
  },
  {
    href: 'communities',
    text: 'Communities',
    buttonProps: { id: 'Button_Communities', name: 'communities' },
  },
  {
    href: 'collective-rewards',
    text: 'Collective Rewards',
    buttonProps: { id: 'Button_CollectiveRewards', name: 'collective-rewards' },
  },
  {
    href: 'builders',
    text: 'Builders',
    buttonProps: { id: 'Button_Builders', name: 'builders' },
  },
] as const satisfies MenuData[]
