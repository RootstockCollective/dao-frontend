export interface SidebarData {
  text: string
  href: string
  buttonProps: {
    id: string
    name: string
  }
}

export const sidebarData = [
  {
    href: '',
    text: 'My Collective',
    buttonProps: { id: 'Button_User', name: 'user' },
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
] as const satisfies SidebarData[]
