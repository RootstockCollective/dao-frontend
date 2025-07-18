import React from 'react'
import InfoIcon from './InfoIcon'
import { Typography } from '@/components/TypographyNew/Typography'

export function PreviewLabel() {
  return (
    <div className="flex gap-1 items-center justify-end flex-nowrap">
      <InfoIcon />
      <Typography className="text-sm md:text-base leading-tight text-text-40 whitespace-nowrap">
        This is a preview of how the proposal will look
      </Typography>
    </div>
  )
}
