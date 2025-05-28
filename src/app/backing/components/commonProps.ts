import { HTMLAttributes } from 'react'

export type StylableComponentProps<T extends Element> = {
  className?: HTMLAttributes<T>['className']
}

export type CommonComponentProps<T extends Element = HTMLDivElement> = StylableComponentProps<T>
