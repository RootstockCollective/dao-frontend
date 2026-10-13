import { fn } from 'storybook/test'

const open = fn().mockName('useAppKit.open')
const close = fn().mockName('useAppKit.close')

export const useAppKit = () => ({ open, close })
export const createAppKit = fn().mockName('createAppKit')
