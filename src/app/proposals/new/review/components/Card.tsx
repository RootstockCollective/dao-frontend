import { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  title: string
}

export function Card({ title, children }: Props) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="text-xs text-bg-0 leading-none font-rootstock-sans">{title}</div>
      <div className="font-rootstock-sans text-text-100 leading-normal font-normal text-base">{children}</div>
    </div>
  )
}
