'use client'

import { useRouter } from 'next/navigation'
import { LeftArrow } from './LeftArrow'
import { Typography } from '../Typography'
import { HTMLAttributes, MouseEvent } from 'react'
import { cn } from '@/lib/utils/utils'

export type BackButtonProps = HTMLAttributes<HTMLDivElement>

export function BackButton({ className, ...props }: BackButtonProps) {
  const router = useRouter()
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (props.onClick) props.onClick(e)
    router.back()
  }
  return (
    <div
      {...props}
      onClick={onClick}
      className={cn(className, 'w-fit p-3 flex flex-row flex-nowrap gap-2 cursor-pointer')}
    >
      <LeftArrow />
      <Typography
        tagVariant="p"
        className="text-base text-primary font-bold font-rootstock-sans leading-tight"
      >
        Go Back
      </Typography>
    </div>
  )
}
