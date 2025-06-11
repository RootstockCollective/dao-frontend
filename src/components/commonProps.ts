import { HTMLAttributes, PropsWithChildren } from 'react'

export type StylableComponentProps<T extends Element> = {
  className?: HTMLAttributes<T>['className']
  style?: HTMLAttributes<T>['style']
}

export type CommonComponentProps<T extends Element = HTMLDivElement> = StylableComponentProps<T> &
  PropsWithChildren
