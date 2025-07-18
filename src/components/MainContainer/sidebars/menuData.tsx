interface MenuData {
  text: string
  href: string
  buttonProps: {
    id: string
    name: string
  }
}

export const menuData = [
  {
    href: '',
    text: 'My Collective',
    buttonProps: { id: 'Button_User', name: 'user' },
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
    href: 'delegate',
    text: 'Delegate',
    buttonProps: { id: 'Button_Delegate', name: 'delegate' },
  },
] as const satisfies MenuData[]
