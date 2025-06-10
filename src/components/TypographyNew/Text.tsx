import { ComponentPropsWithoutRef, ElementType } from 'react'

type Props<T extends ElementType> = {
  as?: T
} & ComponentPropsWithoutRef<T>

export function Text<T extends ElementType = 'p'>({ as = 'p' as T, children, onClick, ...props }: Props<T>) {
  const Component: ElementType = as
  return <Component {...props}>{children}</Component>
}

function Foo() {
  return (
    <>
      <Text as="a" className="p-2" href="" />
    </>
  )
}
