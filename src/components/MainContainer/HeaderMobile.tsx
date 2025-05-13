import { HTMLAttributes } from 'react'
import { RootstockLogoIcon } from '../Icons'
import { StarIcon, SunIcon } from './icons'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <header className="relative h-21 border-b border-dark-gray">
      <div className="h-full flex items-center justify-center">
        <RootstockLogoIcon />
      </div>
      <div className="absolute top-0 left-0 w-full h-full px-4 flex flex-row items-center justify-between">
        <div className="">HAM</div>
        <div className="flex gap-3">
          <StarIcon />
          <SunIcon />
        </div>
      </div>
    </header>
  )
}
