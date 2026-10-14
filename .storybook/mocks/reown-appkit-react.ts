/**
 * Replaces `@reown/appkit/react` in the Storybook build (see `webpackFinal` in `.storybook/main.ts`).
 *
 * AppKit hooks throw unless `createAppKit` ran, and only the app's `ContextProviders` calls it
 * (it needs a project ID and network access). This mock covers everything `src/` imports from the
 * package today. If a component starts using another export (`useAppKitAccount`, `useDisconnect`,
 * `useAppKitState`, ...), add it here, otherwise its story fails at runtime with "is not a function".
 */
import { fn } from 'storybook/test'

const open = fn().mockName('useAppKit.open')
const close = fn().mockName('useAppKit.close')

export const useAppKit = () => ({ open, close })
export const createAppKit = fn().mockName('createAppKit')
