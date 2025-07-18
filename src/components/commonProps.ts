import { HTMLAttributes, PropsWithChildren } from 'react'

export type StylableComponentProps<T extends Element> = {
  className?: HTMLAttributes<T>['className']
  style?: HTMLAttributes<T>['style']
}

export type CommonComponentProps<T extends Element | null = null> = T extends Element
  ? StylableComponentProps<T> & HTMLAttributes<T> & PropsWithChildren
  : StylableComponentProps<HTMLDivElement> & PropsWithChildren
